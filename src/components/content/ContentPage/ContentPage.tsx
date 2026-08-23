'use client';

import { useState, type FormEvent } from 'react';
import { sendContactMessage } from '@/lib/forms';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    const result = await sendContactMessage({ name, email, message });
    if (!result.ok) {
      setStatus('error');
      setError(result.error ?? 'No se ha podido enviar el mensaje.');
      return;
    }

    setStatus('success');
  }

  if (status === 'success') {
    return (
      <div className={styles.confirmation} role="status">
        <p>
          Gracias, {name.split(' ')[0]}. Hemos recibido tu mensaje y te responderemos a {email} lo antes posible.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.label}>Nombre</span>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={styles.input} />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Mensaje</span>
        <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={styles.textarea} />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submit} disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}