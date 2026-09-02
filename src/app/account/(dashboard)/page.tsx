'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/components/checkout/checkoutForm.module.css';
import pageStyles from './AccountProfile.module.css';

export default function AccountProfilePage() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    const result = await updateProfile({ fullName, email });
    if (!result.ok) {
      setError(result.error ?? 'No se han podido guardar los cambios.');
      return;
    }
    setFeedback('Datos actualizados.');
  }

  return (
    <div className={pageStyles.page}>
      <h1 className={pageStyles.title}>Mi perfil</h1>

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

        {error && <p style={{ color: '#c0392b', fontSize: '0.85rem' }}>{error}</p>}
        {feedback && <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>{feedback}</p>}

        <button type="submit" className={styles.submit}>
          Guardar cambios
        </button>
      </form>
      {/* TODO: cambio de contraseña (requiere validar la contraseña actual) */}
    </div>
  );
}