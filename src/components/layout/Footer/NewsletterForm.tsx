'use client';

import { useState, type FormEvent } from 'react';
import { subscribeToNewsletter } from '@/lib/forms';
import styles from './Footer.module.css';

export default function NewsletterForm({ placeholder }: { placeholder: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    const result = await subscribeToNewsletter(email);
    if (!result.ok) {
      setStatus('error');
      setError(result.error ?? 'No se ha podido completar la suscripción.');
      return;
    }

    setStatus('success');
    setEmail('');
  }

  if (status === 'success') {
    return <p className={styles.newsletterFeedback}>¡Gracias! Ya estás suscrito.</p>;
  }

  return (
    <>
      <form className={styles.newsletter} onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder={placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={styles.newsletterInput}
          aria-label={placeholder}
        />
        <button type="submit" className={styles.newsletterButton} aria-label="Enviar" disabled={status === 'loading'}>
          &#8594;
        </button>
      </form>
      {error && <p className={styles.newsletterError}>{error}</p>}
    </>
  );
}