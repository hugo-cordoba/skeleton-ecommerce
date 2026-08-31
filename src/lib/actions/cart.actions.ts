'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildCartLineId } from '@/lib/cart-utils';
import { getOrCreateGuestId, readGuestId, clearGuestId } from '@/lib/guest';
import { formatPrice, parsePriceToNumber } from '@/lib/currency';

export interface CartItemDTO {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: string;
  unitPrice: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
  maxStock: number;
}

export interface CartDTO {
  items: CartItemDTO[];
  itemCount: number;
  subtotal: number;
  subtotalFormatted: string;
}

type Actor = { userId: string } | { guestId: string };

/** Identifica quién está operando: usuario logueado o invitado por cookie. */
async function getActor(createGuestIfMissing = false): Promise<Actor | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return { userId: session.user.id };

  const guestId = createGuestIfMissing ? getOrCreateGuestId() : readGuestId();
  return guestId ? { guestId } : null;
}

function actorWhere(actor: Actor) {
  return 'userId' in actor ? { userId: actor.userId } : { guestId: actor.guestId };
}

function toDTO(row: {
  id: string;
  quantity: number;
  selectedVariants: unknown;
  product: { id: string; slug: string; name: string; image: string; price: string; stock: number };
}): CartItemDTO {
  return {
    id: row.id,
    productId: row.product.id,
    slug: row.product.slug,
    name: row.product.name,
    image: row.product.image,
    price: row.product.price,
    unitPrice: parsePriceToNumber(row.product.price),
    quantity: row.quantity,
    selectedVariants: (row.selectedVariants as Record<string, string> | null) ?? undefined,
    maxStock: row.product.stock,
  };
}

function toCartDTO(items: CartItemDTO[]): CartDTO {
  const { itemCount, subtotal } = items.reduce(
    (acc, item) => ({
      itemCount: acc.itemCount + item.quantity,
      subtotal: acc.subtotal + item.unitPrice * item.quantity,
    }),
    { itemCount: 0, subtotal: 0 }
  );
  return { items, itemCount, subtotal, subtotalFormatted: formatPrice(subtotal) };
}

/** Lee el carrito del usuario/invitado actual. Se puede llamar desde un Server Component o desde el cliente. */
export async function getCart(): Promise<CartDTO> {
  const actor = await getActor();
  if (!actor) return toCartDTO([]);

  const rows = await prisma.cartItem.findMany({
    where: actorWhere(actor),
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  });
  return toCartDTO(rows.map(toDTO));
}

export async function addToCartAction(
  productId: string,
  quantity: number,
  selectedVariants?: Record<string, string>
): Promise<CartDTO> {
  const actor = (await getActor(true))!; // siempre hay actor: se crea invitado si hace falta

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Producto no encontrado.');
  if (product.stock <= 0) throw new Error('Producto sin stock disponible.');

  const lineId = buildCartLineId(productId, selectedVariants);
  const existing = await prisma.cartItem.findFirst({ where: { ...actorWhere(actor), lineId } });

  if (existing) {
    const nextQuantity = Math.min(existing.quantity + quantity, product.stock);
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
  } else {
    await prisma.cartItem.create({
      data: {
        ...actorWhere(actor),
        productId,
        quantity: Math.min(quantity, product.stock),
        selectedVariants: selectedVariants ?? undefined,
        lineId,
      },
    });
  }

  return getCart();
}

export async function updateCartItemQuantityAction(cartItemId: string, quantity: number): Promise<CartDTO> {
  const actor = await getActor();
  if (!actor) return getCart();

  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId }, include: { product: true } });
  const owns = item && ('userId' in actor ? item.userId === actor.userId : item.guestId === actor.guestId);
  if (!item || !owns) return getCart(); // no toca líneas ajenas

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: Math.min(quantity, item.product.stock) },
    });
  }

  return getCart();
}

export async function removeCartItemAction(cartItemId: string): Promise<CartDTO> {
  return updateCartItemQuantityAction(cartItemId, 0);
}

export async function clearCartAction(): Promise<CartDTO> {
  const actor = await getActor();
  if (actor) await prisma.cartItem.deleteMany({ where: actorWhere(actor) });
  return getCart();
}

/** Se llama justo después de un login/registro exitoso: pasa el carrito de invitado a la cuenta. */
export async function mergeGuestCartIntoUserAction(): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const guestId = readGuestId();
  if (!userId || !guestId) return;

  const guestItems = await prisma.cartItem.findMany({ where: { guestId } });

  for (const guestItem of guestItems) {
    const existing = await prisma.cartItem.findFirst({ where: { userId, lineId: guestItem.lineId } });

    if (existing) {
      const product = await prisma.product.findUnique({ where: { id: guestItem.productId } });
      const nextQuantity = Math.min(existing.quantity + guestItem.quantity, product?.stock ?? existing.quantity);
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
      await prisma.cartItem.delete({ where: { id: guestItem.id } });
    } else {
      await prisma.cartItem.update({ where: { id: guestItem.id }, data: { userId, guestId: null } });
    }
  }
}

export async function clearGuestSessionAction(): Promise<void> {
  clearGuestId();
}
