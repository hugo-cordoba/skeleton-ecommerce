'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { NavLink } from '@/types/section.types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import AuthSidebar from '@/components/auth/AuthSidebar/AuthSidebar';
import SearchDropdown from '@/components/product/SearchDropdown/SearchDropdown';
import styles from './Header.module.css';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  siteName: string;
  navLinks?: NavLink[];
  searchLabel?: string;
  loginLabel?: string;
  wishlistHref?: string;
  wishlistLabel?: string;
  cartHref?: string;
  cartLabel?: string;
  cartCount?: number;
}

export default function Header({
  siteName,
  navLinks = [],
  searchLabel = 'Buscar',
  loginLabel = 'Iniciar sesión',
  wishlistHref = '#',
  wishlistLabel = 'Wishlist',
  cartHref = '#',
  cartLabel = 'Cesta',
  cartCount,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const { user, hydrated: authHydrated } = useAuth();
  const displayCartCount = cartCount ?? itemCount;
  const prevCartCountRef = useRef(displayCartCount);
  const prevWishlistCountRef = useRef(wishlistItemCount);
  const [cartBump, setCartBump] = useState(false);
  const [wishlistBump, setWishlistBump] = useState(false);
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';

  useEffect(() => {
    if (displayCartCount > prevCartCountRef.current) setCartBump(true);
    prevCartCountRef.current = displayCartCount;
  }, [displayCartCount]);

  useEffect(() => {
    if (wishlistItemCount > prevWishlistCountRef.current) setWishlistBump(true);
    prevWishlistCountRef.current = wishlistItemCount;
  }, [wishlistItemCount]);

  // Bloquea el scroll en <html>, no en <body>: <html> tiene overflow-y:
  // scroll explícito en globals.css, así que es el elemento que realmente
  // hace scroll (no hereda el "propagation to viewport" que usaría body).
  // Bloquear body en su lugar lo convierte en su propio contenedor de
  // scroll y rompe el position: sticky del header.
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen || authOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen, authOpen, searchOpen]);

  useEffect(() => {
    if (!menuOpen && !authOpen && !searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setAuthOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, authOpen, searchOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('authRequired') === '1' || params.has('callbackUrl')) {
      setAuthOpen(true);
      params.delete('authRequired');
      const nextSearch = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (nextSearch ? `?${nextSearch}` : ''));
    }
  }, []);

  function openAuth() {
    setMenuOpen(false);
    setSearchOpen(false);
    setAuthOpen(true);
  }

  function toggleSearch() {
    if (isSearchPage) return;
    setMenuOpen(false);
    setAuthOpen(false);
    setSearchOpen((open) => !open);
  }

  function handleWishlistClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!user && authHydrated) {
      e.preventDefault();
      openAuth();
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.side}>
          <button
            type="button"
            className={styles.menuButton}
            data-open={menuOpen}
            onClick={() => {
              setAuthOpen(false);
              setSearchOpen(false);
              setMenuOpen((open) => !open);
            }}
            aria-expanded={menuOpen}
            aria-controls="site-sidebar"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span className={styles.menuIcon} />
          </button>
        </div>

        <Link href="/" className={styles.logo}>
          {siteName}
        </Link>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={toggleSearch}
            className={`${styles.actionButton} ${isSearchPage ? styles.actionButtonActive : ''}`}
            aria-expanded={searchOpen}
            aria-controls="search-dropdown"
            aria-current={isSearchPage ? 'page' : undefined}
          >
            {searchLabel}
          </button>

          {authHydrated && user ? (
            <Link href="/account" className={`${styles.actionLink} ${styles.hideOnMobile}`}>
              {user.fullName.split(' ')[0]}
            </Link>
          ) : (
            <button type="button" onClick={openAuth} className={`${styles.actionButton} ${styles.hideOnMobile}`}>
              {loginLabel}
            </button>
          )}

          <Link
            href={wishlistHref}
            className={`${styles.actionLink} ${styles.hideOnMobile} ${wishlistBump ? styles.bump : ''}`}
            onClick={handleWishlistClick}
            onAnimationEnd={() => setWishlistBump(false)}
          >
            {wishlistLabel} ({wishlistItemCount})
          </Link>
          <Link
            href={cartHref}
            className={`${styles.actionLink} ${cartBump ? styles.bump : ''}`}
            onAnimationEnd={() => setCartBump(false)}
          >
            {cartLabel} ({displayCartCount})
          </Link>
        </div>
      </div>

      {!isSearchPage && <SearchDropdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}

      <div className={styles.overlay} data-open={menuOpen} onClick={() => setMenuOpen(false)} aria-hidden="true" />

      <aside id="site-sidebar" className={styles.sidebar} data-open={menuOpen} aria-hidden={!menuOpen}>
        <nav>
          <ul className={styles.sidebarList}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          {authHydrated && user ? (
            <a href="/account" onClick={() => setMenuOpen(false)}>
              {user.fullName.split(' ')[0]}
            </a>
          ) : (
            <button type="button" className={styles.sidebarLogout} onClick={openAuth}>
              {loginLabel}
            </button>
          )}

          <a
            href={wishlistHref}
            onClick={(e) => {
              handleWishlistClick(e);
              if (user || !authHydrated) {
                setMenuOpen(false);
              }
            }}
          >
            {wishlistLabel} ({wishlistItemCount})
          </a>
        </div>
      </aside>

      <AuthSidebar isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}