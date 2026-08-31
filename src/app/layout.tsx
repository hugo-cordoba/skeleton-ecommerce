import type { Metadata } from 'next';
import { siteConfig } from '@/config/site.config';
import { getCart } from '@/lib/actions/cart.actions';
import { getWishlist } from '@/lib/actions/wishlist.actions';
import { getOrders } from '@/lib/actions/order.actions';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { AuthProvider } from '@/context/AuthContext';
import { AddressBookProvider } from '@/context/AddressBookContext';
import AuthSessionProvider from '@/context/AuthSessionProvider';
import './globals.css';
import '@/lib/env';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [initialCart, initialWishlist, initialOrders] = await Promise.all([getCart(), getWishlist(), getOrders()]);

  const themeVars = {
    '--color-primary': siteConfig.colors.primary,
    '--color-primary-light': siteConfig.colors.primaryLight,
    '--color-secondary': siteConfig.colors.secondary,
    '--color-background': siteConfig.colors.background,
    '--color-surface': siteConfig.colors.surface,
    '--color-text': siteConfig.colors.text,
    '--color-text-muted': siteConfig.colors.textMuted,
    '--font-heading': `'Helvetica', Arial, sans-serif`,
    '--font-body': `'Helvetica', Arial, sans-serif`,
  } as React.CSSProperties;

  return (
    <html lang="es">
      <body style={themeVars}>
        <AuthSessionProvider>
          <AuthProvider>
            <CartProvider initialCart={initialCart}>
              <WishlistProvider initialItems={initialWishlist}>
                <AddressBookProvider>
                  <OrdersProvider initialOrders={initialOrders}>{children}</OrdersProvider>
                </AddressBookProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}