'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../Auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const result = register(fullName, email, password);
    if (!result.ok) {
      setError(result.error ?? 'No se ha podido crear la cuenta.');
      return;
    }
    router.push('/account');
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Crear cuenta</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Nombre completo</span>
          <input
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={styles.input}
          />
        </label>

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
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Repite la contraseña</span>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={styles.input}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submit}>
          Crear cuenta
        </button>
      </form>

      <p className={styles.switch}>
        ¿Ya tienes cuenta? <Link href="/account/login">Inicia sesión</Link>
      </p>
    </div>
  );
}