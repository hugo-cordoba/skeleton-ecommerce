import Link from 'next/link';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';

export default function NotFound() {
  return (
    <>
      <Header
        siteName={siteConfig.name}
        navLinks={siteNavLinks}
        searchHref="/search"
        wishlistHref="/account/wishlist"
        cartHref="/cart"
      />
      <main>
        <h1>Pagina no encontrada</h1>
        <p>No hemos encontrado lo que buscabas.</p>
        <Link href="/">Volver al inicio</Link>
      </main>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </>
  );
}