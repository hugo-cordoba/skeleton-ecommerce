'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import { useCookieConsent } from '@/context/CookieConsentContext';
import styles from './CookieConsentBanner.module.css';

export default function CookieConsentBanner() {
  const { isBannerVisible, acceptAll, openPreferences } = useCookieConsent();

  if (!isBannerVisible) return null;

  return (
    <div className={styles.banner} role="region" aria-label="Uso de cookies">
      <p className={styles.text}>
        Usamos cookies para mejorar tu experiencia.{' '}
        <Link href="/cookies" className={styles.link}>
          Ver política
        </Link>
        .
      </p>

      <div className={styles.actions}>
        <button type="button" className={styles.textButton} onClick={openPreferences}>
          Preferencias
        </button>
        <Button variant="primary" onClick={acceptAll}>
          Aceptar todo
        </Button>
      </div>
    </div>
  );
}