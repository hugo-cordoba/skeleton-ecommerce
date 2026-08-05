import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { siteConfig } from '@/config/site.config';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Los colores de site.config.ts se inyectan aqui como variables CSS.
  // Cambiarlos alli retematiza toda la web sin tocar ningun componente.
  const themeVars = {
    '--color-primary': siteConfig.colors.primary,
    '--color-primary-light': siteConfig.colors.primaryLight,
    '--color-secondary': siteConfig.colors.secondary,
    '--color-background': siteConfig.colors.background,
    '--color-surface': siteConfig.colors.surface,
    '--color-text': siteConfig.colors.text,
    '--color-text-muted': siteConfig.colors.textMuted,
  } as React.CSSProperties;

  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body style={themeVars}>{children}</body>
    </html>
  );
}
