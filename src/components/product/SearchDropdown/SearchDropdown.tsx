'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchDropdown.module.css';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Desplegable de búsqueda del Header: un panel pequeño (no a pantalla
 * completa, a diferencia del menú lateral o el sidebar de acceso) que
 * cuelga justo debajo de la barra del Header. Al enviar la búsqueda,
 * navega a /search?q=... (la misma página de resultados que usa
 * SearchForm) y se cierra solo.
 */
export default function SearchDropdown({ isOpen, onClose }: SearchDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus al abrir, igual que el resto de paneles del Header.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Igual que el overlay del menú móvil o AuthSidebar: cierra al hacer
          click fuera, pero sin oscurecer la página (panel pequeño, no modal). */}
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />

      <div id="search-dropdown" className={styles.panel} role="search">
        <form className={styles.form} onSubmit={handleSubmit}>
          <svg className={styles.icon} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M13.3 13.3L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar productos..."
            className={styles.input}
            aria-label="Buscar productos"
          />

          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar búsqueda">
            <span aria-hidden="true">&times;</span>
          </button>
        </form>
      </div>
    </>
  );
}