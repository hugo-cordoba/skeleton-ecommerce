'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import { useCookieConsent, type CookiePreferences } from '@/context/CookieConsentContext';
import styles from './CookiePreferencesModal.module.css';

export default function CookiePreferencesModal() {
  const { isPreferencesOpen, preferences, savePreferences, acceptAll, rejectAll, closePreferences } =
    useCookieConsent();
  const [draft, setDraft] = useState<CookiePreferences>(preferences);

  // Cada vez que se abre el panel, parte de la eleccion ya guardada (o
  // de los valores por defecto si todavia no se ha elegido nada).
  useEffect(() => {
    if (isPreferencesOpen) setDraft(preferences);
  }, [isPreferencesOpen, preferences]);

  useEffect(() => {
    if (!isPreferencesOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePreferences();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPreferencesOpen, closePreferences]);

  if (!isPreferencesOpen) return null;

  function toggle(key: keyof CookiePreferences) {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={closePreferences}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="cookie-preferences-title" className={styles.title}>
            Preferencias de cookies
          </h2>
          <button type="button" className={styles.close} onClick={closePreferences} aria-label="Cerrar">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <p className={styles.intro}>
          Elige qué cookies quieres permitir. Puedes volver a cambiarlo cuando quieras desde &quot;Configurar
          cookies&quot; en el pie de página. Más detalle en la{' '}
          <Link href="/cookies" className={styles.link} onClick={closePreferences}>
            política de cookies
          </Link>
          .
        </p>

        <div className={styles.categories}>
          <div className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>Necesarias</span>
              <span className={styles.toggleLocked}>Siempre activas</span>
            </div>
            <p className={styles.categoryDescription}>
              Imprescindibles para navegar, mantener la cesta y la sesión iniciada, y la seguridad de la web. No
              se pueden desactivar.
            </p>
          </div>

          <div className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>Analíticas</span>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={() => toggle('analytics')}
                  aria-label="Activar cookies analíticas"
                />
                <span className={styles.toggleTrack} aria-hidden="true" />
              </label>
            </div>
            <p className={styles.categoryDescription}>
              Nos ayudan a entender cómo se usa la web (páginas visitadas, errores) de forma agregada, para
              poder mejorarla.
            </p>
          </div>

          <div className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>Marketing</span>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={draft.marketing}
                  onChange={() => toggle('marketing')}
                  aria-label="Activar cookies de marketing"
                />
                <span className={styles.toggleTrack} aria-hidden="true" />
              </label>
            </div>
            <p className={styles.categoryDescription}>
              Se usan para mostrar publicidad relevante en esta web y en otras, según tu navegación.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.textButton} onClick={rejectAll}>
            Rechazar todo
          </button>

          <div className={styles.footerMainActions}>
            <button type="button" className={styles.btnOutline} onClick={acceptAll}>
              Aceptar todo
            </button>
            <Button variant="primary" onClick={() => savePreferences(draft)}>
              Guardar preferencias
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}