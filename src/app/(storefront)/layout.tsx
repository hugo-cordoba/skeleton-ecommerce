import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';

/**
 * LAYOUT DE TIENDA: envuelve todas las paginas de navegacion normal
 * (home, busqueda, producto, categoria, marca, carrito, contenido)
 * con el Header y el Footer.
 *
 * Al vivir en un route group "(storefront)" no añade ningun segmento
 * a la URL: sigue siendo "/", "/cart", "/products/[slug]", etc.
 *
 * Checkout y login/registro NO usan este layout a proposito (menos
 * distracciones = mejor conversion), por eso viven fuera del grupo.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header siteName={siteConfig.name} navLinks={siteNavLinks} cartCount={0} />
      <main>{children}</main>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </>
  );
}
