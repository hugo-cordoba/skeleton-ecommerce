import type { CartItem } from '@/context/CartContext';

/**
 * Tipos de pedido, compartidos entre el checkout (que genera el pedido)
 * y el historial (que lo persiste y lo muestra). Antes vivian dentro de
 * CheckoutContext; se sacan aqui para que OrdersContext los use sin
 * depender del contexto de checkout.
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

/** Estado del pedido. Simulado por ahora (no hay backend/logistica real). */
export type OrderStatus = 'processing' | 'shipped' | 'delivered';

export interface Order {
  orderNumber: string;
  email: string;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  /** ISO string (Date.toISOString()), para guardarlo tal cual en JSON/localStorage. */
  createdAt: string;
}