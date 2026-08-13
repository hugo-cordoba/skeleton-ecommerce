import Link from 'next/link';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';

const accountNav = [
  { label: 'Perfil', href: '/account' },
  { label: 'Pedidos', href: '/account/orders' },
  { label: 'Direcciones', href: '/account/addresses' },
  { label: 'Lista de deseos', href: '/account/wishlist' },
];

/**
 * LAYOUT DEL AREA PRIVADA: mantiene el Header/Footer de la tienda
 * (un usuario logueado sigue queriendo buscar, ver el carrito...) y
 * añade una navegacion secundaria propia de la cuenta.
 *
 * TODO: cuando haya autenticacion real, este layout es el sitio para
 * comprobar la sesion y redirigir a /account/login si no hay usuario.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header siteName={siteConfig.name} navLinks={siteNavLinks} />
      <div>
        <nav>
          <ul>
            {accountNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <main>{children}</main>
      </div>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </>
  );
}