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

export default function SearchDropdown({ isOpen = false, onClose, inline = false, defaultValue = '' }: SearchDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function handleClear() {
    setQuery('');
    inputRef.current?.focus();
    router.push('/search');
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

      {inline && query && (
        <button type="button" className={styles.clear} onClick={handleClear}>
          Borrar
        </button>
      )}

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
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div id="search-dropdown" className={`${styles.panelBase} ${styles.panel}`} role="search">
        {form}
      </div>
    </>
  );
}