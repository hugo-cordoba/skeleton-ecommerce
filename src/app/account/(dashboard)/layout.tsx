import Link from 'next/link';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import AccountGuard from '@/components/account/AccountGuard/AccountGuard';
import { siteNavLinks, footerContent } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';

const accountNav = [
  { label: 'Perfil', href: '/account' },
  { label: 'Pedidos', href: '/account/orders' },
  { label: 'Direcciones', href: '/account/addresses' },
  { label: 'Lista de deseos', href: '/account/wishlist' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header
        siteName={siteConfig.name}
        navLinks={siteNavLinks}
        searchHref="/search"
        wishlistHref="/account/wishlist"
        cartHref="/cart"
      />
      <AccountGuard>
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
      </AccountGuard>
      <Footer siteName={siteConfig.name} navLinks={siteNavLinks} {...footerContent} />
    </>
  );
}