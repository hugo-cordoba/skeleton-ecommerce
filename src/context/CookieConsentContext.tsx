
'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Consentimiento de cookies (RGPD). Las "necesarias" siempre estan
 * activas (no son opcionales); solo se pide consentimiento explicito
 * para analitica y marketing. Se guarda en una cookie real (no
 * localStorage) para poder leerla en el futuro tambien desde servidor,
 * con caducidad de 12 meses: pasado ese plazo se vuelve a pedir
 * consentimiento, como recomienda la AEPD.
 */
export interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

interface StoredConsent extends CookiePreferences {
  updatedAt: string;
}

interface CookieConsentContextValue {
  /** true una vez se ha leido la cookie existente (o comprobado que no hay ninguna) en el cliente. */
  hydrated: boolean;
  /** true si el usuario ya ha aceptado, rechazado o guardado unas preferencias. */
  hasChosen: boolean;
  preferences: CookiePreferences;
  /** Banner inferior: solo se muestra tras hidratar y si todavia no hay eleccion guardada. */
  isBannerVisible: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const CONSENT_COOKIE_NAME = 'cookie_consent';
const CONSENT_COOKIE_MAX_AGE_DAYS = 365;

const DEFAULT_PREFERENCES: CookiePreferences = { analytics: true, marketing: true };

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

function readConsentCookie(): StoredConsent | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`));
  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match[1])) as StoredConsent;
  } catch {
    return null; // cookie corrupta: se trata como si no hubiera eleccion previa
  }
}

function writeConsentCookie(preferences: CookiePreferences): void {
  const value: StoredConsent = { ...preferences, updatedAt: new Date().toISOString() };
  const maxAgeSeconds = CONSENT_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    const stored = readConsentCookie();
    if (stored) {
      setPreferences({ analytics: stored.analytics, marketing: stored.marketing });
      setHasChosen(true);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: CookiePreferences) => {
    setPreferences(next);
    setHasChosen(true);
    setIsPreferencesOpen(false);
    writeConsentCookie(next);
    // TODO: cuando se active analitica/marketing real (GA4, Meta Pixel...),
    // cargar esos scripts aqui solo si next.analytics / next.marketing es true,
    // y no cargarlos (o retirarlos) si el usuario los rechaza.
  }, []);

  const acceptAll = useCallback(() => persist({ analytics: true, marketing: true }), [persist]);
  const rejectAll = useCallback(() => persist({ analytics: false, marketing: false }), [persist]);
  const savePreferences = useCallback((next: CookiePreferences) => persist(next), [persist]);
  const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

  const value: CookieConsentContextValue = {
    hydrated,
    hasChosen,
    preferences,
    isBannerVisible: hydrated && !hasChosen,
    isPreferencesOpen,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
  };

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent debe usarse dentro de un <CookieConsentProvider>.');
  }
  return context;
}