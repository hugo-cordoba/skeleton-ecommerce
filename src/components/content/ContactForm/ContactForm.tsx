'use client';

import { useState, type FormEvent } from 'react';
import styles from './ContactForm.module.css';

/**
 * Formulario de contacto. Igual que el newsletter del Footer, es
 * decorativo por ahora (sin backend): al enviarlo solo actualiza un
 * estado local para mostrar confirmacion. Conectar a una API route o
 * proveedor de email (Resend, Formspree...) cuando haya backend.
 */
export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
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
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
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
        <span className={styles.label}>Mensaje</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={styles.textarea}
        />
      </label>

      <button type="submit" className={styles.submit}>
        Enviar mensaje
      </button>
    </form>
  );
}
