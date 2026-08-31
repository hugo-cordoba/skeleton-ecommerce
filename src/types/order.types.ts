import type { ShippingAddress as _ShippingAddress } from './order.types';

/**
 * Tipos de pedido, compartidos entre el checkout (que genera el pedido),
 * el historial (que lo persiste y lo muestra) y las server actions que
 * hablan con Prisma. Antes `items` reutilizaba el tipo `CartItem` del
 * carrito; ahora es su propio tipo, alineado con el modelo `OrderItem`
 * de Prisma (name/image/unitPrice ya son una "foto" del momento de la
 * compra, no dependen del carrito).
 */

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  price: number;
  priceFormatted: string;
  etaLabel: string;
}

/** Estado del pedido, en minúsculas en el cliente; se mapea desde/hacia el enum OrderStatus de Prisma. */
export type OrderStatus = 'processing' | 'shipped' | 'delivered';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Order {
  orderNumber: string;
  email: string;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}