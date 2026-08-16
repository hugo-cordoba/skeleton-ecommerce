import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header
        siteName={siteConfig.name}
        navLinks={siteNavLinks}
        searchHref="/search"
        wishlistHref="/account/wishlist"
        cartHref="/cart"
      />
      <main>{children}</main>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </>
  );
}