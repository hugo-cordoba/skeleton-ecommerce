'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './LoginSidebar.module.css';

interface LoginSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginSidebar({ isOpen, onClose }: LoginSidebarProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cada vez que se abre, limpia el error del intento anterior.
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error ?? 'No se ha podido iniciar sesión.');
      return;
    }

    setIsSubmitting(false);
    setEmail('');
    setPassword('');
    onClose();
  }

  return (
    <>
      <div className={styles.overlay} data-open={isOpen} onClick={onClose} aria-hidden="true" />

      <aside className={styles.sidebar} data-open={isOpen} aria-hidden={!isOpen}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Inicio sesión</span>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <h2 className={styles.title}>Accede a tu cuenta</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              placeholder="Escribe tu email"
              autoComplete="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.input}
              placeholder="Escribe tu contraseña"
              autoComplete="current-password"
            />
          </label>

          <button type="button" className={styles.forgot}>
            ¿Has olvidado tu contraseña?
          </button>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className={styles.switch}>
          ¿No tienes cuenta?{' '}
          <Link href="/account/register" onClick={onClose}>
            Regístrate para acceder
          </Link>
        </p>

      </aside>
    </>
  );
}