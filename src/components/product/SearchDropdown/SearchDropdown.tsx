'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchDropdown.module.css';

interface SearchDropdownProps {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
  defaultValue?: string;
}

/**
 * Mismo panel de búsqueda en dos sitios:
 * - Desplegable del Header (isOpen/onClose): flota bajo la barra, se abre
 *   y cierra, y al buscar redirige a /search?q=... y se cierra solo.
 * - Barra fija de /search (inline): el mismo panel, pero siempre visible
 *   y anclado en el flujo de la página -- sirve de buscador permanente
 *   ahí, delante del listado de resultados.
 */
export default function SearchDropdown({ isOpen = false, onClose, inline = false, defaultValue = '' }: SearchDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus al abrir, solo aplica al modo desplegable (el inline ya está
  // siempre visible, no tiene sentido robarle el foco a la página).
  useEffect(() => {
    if (!inline && isOpen) inputRef.current?.focus();
  }, [inline, isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    if (!inline) {
      setQuery('');
      onClose?.();
    }
  }

  const form = (
    <form className={styles.form} onSubmit={handleSubmit}>
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

      {!inline && (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar búsqueda">
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </form>
  );

  if (inline) {
    return (
      <div className={`${styles.panelBase} ${styles.panelInline}`} role="search">
        {form}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Igual que el overlay del menú móvil o AuthSidebar: cierra al hacer
          click fuera, pero sin oscurecer la página (panel pequeño, no modal). */}
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />

      <div id="search-dropdown" className={`${styles.panelBase} ${styles.panel}`} role="search">
        {form}
      </div>
    </>
  );
}
