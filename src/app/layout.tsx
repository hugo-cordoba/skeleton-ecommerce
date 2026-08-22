import type { Metadata } from 'next';
import { siteConfig } from '@/config/site.config';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}