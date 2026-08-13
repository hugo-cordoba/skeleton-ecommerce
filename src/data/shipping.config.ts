import type { ShippingMethod } from '@/context/CheckoutContext';
import { formatPrice } from '@/lib/currency';

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    label: 'Envío estándar',
    price: 4.95,
    priceFormatted: formatPrice(4.95),
    etaLabel: '3-5 días laborables',
  },
  {
    id: 'express',
    label: 'Envío express',
    price: 9.95,
    priceFormatted: formatPrice(9.95),
    etaLabel: '1-2 días laborables',
  },
  {
    id: 'pickup',
    label: 'Recogida en tienda',
    price: 0,
    priceFormatted: 'Gratis',
    etaLabel: 'Disponible en 24h',
  },
];