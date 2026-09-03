'use client';

import Link from 'next/link';
import { useCookieConsent } from '@/context/CookieConsentContext';
import styles from './Footer.module.css';

const legalLinks = [
  { label: 'Privacidad', href: '/privacy' },
  { label: 'Términos y condiciones', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Devoluciones', href: '/returns' },
  { label: 'Envíos', href: '/shipping-policy' },
];

/**
 * Unico trozo de cliente del bottomBar del Footer: necesita el contexto
 * de cookies para poder reabrir el panel de preferencias en cualquier
 * momento, tal y como promete el banner de cookies.
 */
export default function FooterLegalLinks() {
  const { openPreferences } = useCookieConsent();

  return (
    <ul className={styles.legalList}>
      {legalLinks.map((link) => (
        <li key={link.href}>
          <Link href={link.href}>{link.label}</Link>
        </li>
      ))}
      <li>
        <button type="button" className={styles.legalButton} onClick={openPreferences}>
          Configurar cookies
        </button>
      </li>
    </ul>
  );
}