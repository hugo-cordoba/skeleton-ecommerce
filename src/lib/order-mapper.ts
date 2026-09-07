import { OrderStatus as PrismaOrderStatus } from '@prisma/client';
import { formatPrice } from '@/lib/currency';
import { shippingMethods } from '@/data/shipping.config';
import type { Order, OrderItem, OrderStatus, ShippingAddress, ShippingMethod } from '@/types/order.types';

export type OrderRow = {
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

export function statusToClient(status: PrismaOrderStatus): OrderStatus {
  switch (status) {
    case PrismaOrderStatus.SHIPPED:
      return 'shipped';
    case PrismaOrderStatus.DELIVERED:
      return 'delivered';
    case PrismaOrderStatus.CANCELLED:
      return 'cancelled';
    default:
      return 'processing';
  }
}

export function statusToPrisma(status: OrderStatus): PrismaOrderStatus {
  switch (status) {
    case 'shipped':
      return PrismaOrderStatus.SHIPPED;
    case 'delivered':
      return PrismaOrderStatus.DELIVERED;
    case 'cancelled':
      return PrismaOrderStatus.CANCELLED;
    default:
      return PrismaOrderStatus.PROCESSING;
  }
}

export function toOrderDTO(row: OrderRow): Order {
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