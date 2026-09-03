'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordAction, validateResetTokenAction } from '@/lib/actions/auth.actions';
import styles from './ResetPasswordForm.module.css';

type Status = 'checking' | 'valid' | 'invalid' | 'done';

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    validateResetTokenAction(token).then((result) => {
      if (!cancelled) setStatus(result.valid ? 'valid' : 'invalid');
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPasswordAction(token, password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'No se ha podido restablecer la contraseña.');
      return;
    }

    setStatus('done');
    setTimeout(() => router.push('/'), 3000);
  }

  if (status === 'checking') {
    return (
      <div className={styles.page}>
        <p>Comprobando enlace...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Enlace no válido</h1>
        <p className={styles.text}>
          Este enlace ha caducado o ya se ha utilizado. Solicita uno nuevo desde el inicio de sesión.
        </p>
        <Link href="/" className={styles.cta}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Contraseña actualizada</h1>
        <p className={styles.text}>Ya puedes iniciar sesión con tu nueva contraseña. Te redirigimos en unos segundos...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Crea una contraseña nueva</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Nueva contraseña</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={styles.input}
            autoComplete="new-password"
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
            autoComplete="new-password"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
        </button>
      </form>
    </div>
  );
}