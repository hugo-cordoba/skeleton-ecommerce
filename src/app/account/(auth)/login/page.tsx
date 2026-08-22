'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../Auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? 'No se ha podido iniciar sesión.');
      return;
    }
    router.push('/account');
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Iniciar sesión</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
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
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submit}>
          Entrar
        </button>
      </form>

      <p className={styles.switch}>
        ¿No tienes cuenta? <Link href="/account/register">Crea una</Link>
      </p>
    </div>
  );
}