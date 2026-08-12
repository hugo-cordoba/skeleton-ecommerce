import Link from 'next/link';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';

/**
 * 404 GLOBAL: Next.js solo usa este fichero (app/not-found.tsx) para
 * rutas que no coinciden con ninguna pagina. Como vive fuera del
 * route group "(storefront)", no hereda ese layout automaticamente,
 * por eso repetimos aqui el Header/Footer para mantener la navegacion.
 */
export default function NotFound() {
  return (
    <>
      <Header siteName={siteConfig.name} navLinks={siteNavLinks} cartCount={0} />
      <main>
        <h1>Pagina no encontrada</h1>
        <p>No hemos encontrado lo que buscabas.</p>
        <Link href="/">Volver al inicio</Link>
      </main>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </>
  );
}
