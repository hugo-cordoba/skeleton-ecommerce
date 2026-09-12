'use client';

import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
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
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  // Solo aplica al popup (no inline): distingue "hay una busqueda en
  // curso lanzada desde aqui" de cualquier otra cosa, para saber cuando
  // cerrar el panel una vez la pagina de resultados este lista.
  const searchInFlightRef = useRef(false);

  useEffect(() => {
    if (!inline && isOpen) inputRef.current?.focus();
  }, [inline, isOpen]);

  // El popup se queda abierto (con el loader) mientras Next prepara la
  // pagina de destino; solo se cierra y se limpia el campo cuando la
  // transicion termina, para no dar el salto a una pagina a medio cargar.
  useEffect(() => {
    if (!inline && searchInFlightRef.current && !isPending) {
      searchInFlightRef.current = false;
      setQuery('');
      onClose?.();
    }
  }, [isPending, inline, onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isPending) return;
    searchInFlightRef.current = true;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  }

  function handleClear() {
    if (isPending) return;
    setQuery('');
    inputRef.current?.focus();
    startTransition(() => {
      router.push('/');
    });
  }

  function handleOverlayClick() {
    // Evita cerrar de un clic fuera mientras hay una busqueda en curso.
    if (isPending) return;
    onClose?.();
  }

  const trailingAction = isPending ? (
    <span className={styles.spinner} role="status" aria-label="Buscando..." />
  ) : inline && query ? (
    <button type="button" className={styles.clear} onClick={handleClear}>
      Borrar
    </button>
  ) : !inline ? (
    <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar búsqueda">
      <span aria-hidden="true">&times;</span>
    </button>
  ) : null;

  const form = (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={isPending}>
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar productos..."
        className={styles.input}
        aria-label="Buscar productos"
        disabled={isPending}
      />

      {trailingAction}
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
      <div className={styles.overlay} onClick={handleOverlayClick} aria-hidden="true" />
      <div id="search-dropdown" className={`${styles.panelBase} ${styles.panel}`} role="search">
        {form}
      </div>
    </>
  );
}