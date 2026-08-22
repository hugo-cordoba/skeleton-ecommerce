'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import type { NavLink } from '@/types/section.types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  siteName: string;
  navLinks?: NavLink[];
  searchHref?: string;
  searchLabel?: string;
  loginHref?: string;
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
  searchHref = '#',
  searchLabel = 'Buscar',
  loginHref = '/account/login',
  loginLabel = 'Iniciar sesión',
  wishlistHref = '#',
  wishlistLabel = 'Wishlist',
  cartHref = '#',
  cartLabel = 'Cesta',
  cartCount,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const { user, hydrated: authHydrated, logout } = useAuth();
  const displayCartCount = cartCount ?? itemCount;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.side}>
          <button
            type="button"
            className={styles.menuButton}
            data-open={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
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
          <Link href={searchHref} className={styles.actionLink}>
            {searchLabel}
          </Link>

          {authHydrated && user ? (
            <>
              <Link href="/account" className={`${styles.actionLink} ${styles.hideOnMobile}`}>
                {user.fullName.split(' ')[0]}
              </Link>
              <button type="button" onClick={logout} className={`${styles.actionButton} ${styles.hideOnMobile}`}>
                Salir
              </button>
            </>
          ) : (
            <Link href={loginHref} className={`${styles.actionLink} ${styles.hideOnMobile}`}>
              {loginLabel}
            </Link>
          )}

          <Link href={wishlistHref} className={`${styles.actionLink} ${styles.hideOnMobile}`}>
            {wishlistLabel} ({wishlistItemCount})
          </Link>
          <Link href={cartHref} className={styles.actionLink}>
            {cartLabel} ({displayCartCount})
          </Link>
        </div>
      </div>

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
            <>
              <a href="/account" onClick={() => setMenuOpen(false)}>
                {user.fullName.split(' ')[0]}
              </a>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className={styles.sidebarLogout}
              >
                Salir
              </button>
            </>
          ) : (
            <a href={loginHref} onClick={() => setMenuOpen(false)}>
              {loginLabel}
            </a>
          )}
          <a href={wishlistHref} onClick={() => setMenuOpen(false)}>
            {wishlistLabel} ({wishlistItemCount})
          </a>
        </div>
      </aside>
    </header>
  );
}