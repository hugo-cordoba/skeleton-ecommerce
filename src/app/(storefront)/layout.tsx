import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';
import styles from './StorefrontLayout.module.css';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.pageWrapper}>
      <Header
        siteName={siteConfig.name}
        navLinks={siteNavLinks}
        searchHref="/search"
        wishlistHref="/account/wishlist"
        cartHref="/cart"
      />
      <main className={styles.main}>{children}</main>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </div>
  );
}