import Link from 'next/link';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.pageWrapper}>
      <Header
        siteName={siteConfig.name}
        navLinks={siteNavLinks}
        searchHref="/search"
        wishlistHref="/account/wishlist"
        cartHref="/cart"
      />
      <main className={styles.main}>
        <h1>Pagina no encontrada</h1>
        <p>No hemos encontrado lo que buscabas.</p>
        <Link href="/">Volver al inicio</Link>
      </main>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </div>
  );
}