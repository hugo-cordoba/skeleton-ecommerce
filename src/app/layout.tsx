import type { Metadata } from 'next';
import { siteConfig } from '@/config/site.config';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Los colores de site.config.ts y la tipografia se inyectan aqui
  // como variables CSS. Cambiarlos aqui retematiza toda la web.
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
        {/* CartProvider en la raiz: asi el carrito (y su persistencia en
            localStorage) esta disponible en cualquier ruta -- storefront,
            checkout, account -- sin tener que envolver cada layout a mano. */}
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}