'use server';

import { getServerSession } from 'next-auth/next';
import { OrderStatus as PrismaOrderStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateGuestId, readGuestId } from '@/lib/guest';
import { formatPrice } from '@/lib/currency';
import { shippingMethods } from '@/data/shipping.config';
import type { Order, OrderItem, OrderStatus, ShippingAddress, ShippingMethod } from '@/types/order.types';
import { generateOrderNumber } from '@/lib/order-number';

type Actor = { userId: string } | { guestId: string };

/** Mismo patrón que cart.actions.ts / wishlist.actions.ts: usuario logueado o invitado por cookie. */
async function getActor(createGuestIfMissing = false): Promise<Actor | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return { userId: session.user.id };

  const guestId = createGuestIfMissing ? getOrCreateGuestId() : readGuestId();
  return guestId ? { guestId } : null;
}

function actorWhere(actor: Actor) {
  return 'userId' in actor ? { userId: actor.userId } : { guestId: actor.guestId };
}


function statusToClient(status: PrismaOrderStatus): OrderStatus {
  switch (status) {
    case PrismaOrderStatus.SHIPPED:
      return 'shipped';
    case PrismaOrderStatus.DELIVERED:
      return 'delivered';
    default:
      return 'processing';
  }
}

type OrderRow = {
  orderNumber: string;
  email: string;
  shippingFullName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  shippingPhone: string | null;
  shippingMethodId: string;
  shippingMethodLabel: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  status: PrismaOrderStatus;
  createdAt: Date;
  items: {
    id: string;
    productId: string;
    name: string;
    image: string;
    unitPrice: number;
    quantity: number;
    selectedVariants: unknown;
  }[];
};

/**
 * Reconstruye el shape anidado (ShippingAddress + ShippingMethod) a
 * partir de las columnas "aplanadas" del schema. etaLabel y
 * priceFormatted no se persisten (no cambian tras la compra), así que
 * se recuperan de la config estática de métodos de envío por id.
 */
function toOrderDTO(row: OrderRow): Order {
  const methodConfig = shippingMethods.find((method) => method.id === row.shippingMethodId);

  const shippingAddress: ShippingAddress = {
    fullName: row.shippingFullName,
    addressLine1: row.shippingLine1,
    addressLine2: row.shippingLine2 ?? undefined,
    city: row.shippingCity,
    postalCode: row.shippingPostal,
    country: row.shippingCountry,
    phone: row.shippingPhone ?? undefined,
  };

  const shippingMethod: ShippingMethod = {
    id: row.shippingMethodId,
    label: row.shippingMethodLabel,
    price: row.shippingCost,
    priceFormatted: methodConfig?.priceFormatted ?? formatPrice(row.shippingCost),
    etaLabel: methodConfig?.etaLabel ?? '',
  };

  const items: OrderItem[] = row.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    image: item.image,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    selectedVariants: (item.selectedVariants as Record<string, string> | null) ?? undefined,
  }));

  return {
    orderNumber: row.orderNumber,
    email: row.email,
    shippingAddress,
    shippingMethod,
    items,
    subtotal: row.subtotal,
    shippingCost: row.shippingCost,
    total: row.total,
    status: statusToClient(row.status),
    createdAt: row.createdAt.toISOString(),
  };
}

const include = { items: true };

export interface CreateOrderItemInput {
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface CreateOrderInput {
  email: string;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  items: CreateOrderItemInput[];
  subtotal: number;
}

/**
 * Crea el pedido en BD a partir de lo que hay en el checkout.
 * TODO (Fase A punto 2): con Stripe esto deja de crear el Order
 * directamente al enviar el formulario; el webhook lo creará solo tras
 * confirmar el pago. TODO también: no revalida ni descuenta stock
 * todavía (se añade junto al pago real).
 */
export async function createOrderAction(input: CreateOrderInput): Promise<Order> {
  const actor = await getActor(true);
  if (!actor) throw new Error('No se pudo identificar al comprador.');
  if (input.items.length === 0) throw new Error('El pedido no tiene productos.');

  const total = input.subtotal + input.shippingMethod.price;

  const created = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      ...actorWhere(actor),
      email: input.email,
      shippingFullName: input.shippingAddress.fullName,
      shippingLine1: input.shippingAddress.addressLine1,
      shippingLine2: input.shippingAddress.addressLine2,
      shippingCity: input.shippingAddress.city,
      shippingPostal: input.shippingAddress.postalCode,
      shippingCountry: input.shippingAddress.country,
      shippingPhone: input.shippingAddress.phone,
      shippingMethodId: input.shippingMethod.id,
      shippingMethodLabel: input.shippingMethod.label,
      shippingCost: input.shippingMethod.price,
      subtotal: input.subtotal,
      total,
      status: PrismaOrderStatus.PROCESSING,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          selectedVariants: item.selectedVariants ?? undefined,
        })),
      },
    },
    include,
  });

  return toOrderDTO(created);
}

/** Historial del comprador actual (usuario logueado o invitado), más reciente primero. */
export async function getOrders(): Promise<Order[]> {
  const actor = await getActor();
  if (!actor) return [];

  const rows = await prisma.order.findMany({
    where: actorWhere(actor),
    include,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toOrderDTO);
}

/** Un pedido concreto del comprador actual. Null si no existe o no le pertenece. */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const actor = await getActor();
  if (!actor) return null;

  const row = await prisma.order.findFirst({
    where: { orderNumber, ...actorWhere(actor) },
    include,
  });
  return row ? toOrderDTO(row) : null;
}

/** Mismo patrón que mergeGuestCartIntoUserAction: pasa los pedidos de invitado a la cuenta tras login/registro. */
export async function mergeGuestOrdersIntoUserAction(): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const guestId = readGuestId();
  if (!userId || !guestId) return;

  await prisma.order.updateMany({
    where: { guestId },
    data: { userId, guestId: null },
  });
}

export async function getOrderBySessionId(stripeSessionId: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({ where: { stripeSessionId }, include });
  return row ? toOrderDTO(row) : null;
}
