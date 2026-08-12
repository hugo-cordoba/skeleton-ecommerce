import Link from 'next/link';
import { siteConfig } from '@/config/site.config';

/**
 * LAYOUT DE AUTENTICACION: pantalla centrada y minimalista para
 * login/registro, sin el Header/Footer completo de la tienda
 * (menos distracciones durante el proceso de login).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Link href="/">{siteConfig.name}</Link>
      <main>{children}</main>
    </div>
  );
}
