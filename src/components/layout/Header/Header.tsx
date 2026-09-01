'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { NavLink } from '@/types/section.types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import LoginSidebar from '@/components/auth/LoginSidebar/LoginSidebar';
import styles from './Header.module.css';

interface HeaderProps {
  siteName: string;
  navLinks?: NavLink[];
  searchHref?: string;
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
  searchHref = '#',
  searchLabel = 'Buscar',
  loginLabel = 'Iniciar sesión',
  wishlistHref = '#',
  wishlistLabel = 'Wishlist',
  cartHref = '#',
  cartLabel = 'Cesta',
  cartCount,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { itemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const { user, hydrated: authHydrated, logout } = useAuth();
  const displayCartCount = cartCount ?? itemCount;

  // Un solo efecto controla el scroll del body para los dos paneles
  // (menu y login), asi evitamos que se pisen si alguna vez coinciden.
  useEffect(() => {
    document.body.style.overflow = menuOpen || loginOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, loginOpen]);

  useEffect(() => {
    if (!menuOpen && !loginOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setLoginOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, loginOpen]);

  function openLogin() {
    setMenuOpen(false);
    setLoginOpen(true);
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
              setLoginOpen(false);
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
            <button type="button" onClick={openLogin} className={`${styles.actionButton} ${styles.hideOnMobile}`}>
              {loginLabel}
            </button>
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
            <button type="button" className={styles.sidebarLogout} onClick={openLogin}>
              {loginLabel}
            </button>
          )}
          <a href={wishlistHref} onClick={() => setMenuOpen(false)}>
            {wishlistLabel} ({wishlistItemCount})
          </a>
        </div>
      </aside>

      <LoginSidebar isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}