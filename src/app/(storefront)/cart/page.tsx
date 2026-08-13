import type { Metadata } from 'next';
import CartPageClient from '@/components/cart/CartPageClient/CartPageClient';

export const metadata: Metadata = {
  title: 'Tu cesta',
};

export default function CartPage() {
  return <CartPageClient />;
}