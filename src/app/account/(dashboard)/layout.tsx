import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import AccountGuard from '@/components/account/AccountGuard/AccountGuard';
import AccountSidebar from '@/components/account/AccountSidebar/AccountSidebar';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';
import styles from './Account.module.css';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.pageWrapper}>
      <Header
        siteName={siteConfig.name}
        navLinks={siteNavLinks}
        searchHref="/search"
        wishlistHref="/account/wishlist"
        cartHref="/cart"
      />
      <div className={styles.mainArea}>
        <AccountGuard>
          <div className={styles.wrapper}>
            <AccountSidebar />
            <main className={styles.content}>{children}</main>
          </div>
        </AccountGuard>
      </div>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </div>
  );
}