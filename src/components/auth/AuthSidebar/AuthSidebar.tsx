'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { requestPasswordResetAction } from '@/lib/actions/auth.actions';
import styles from './AuthSidebar.module.css';

interface AuthSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function AuthSidebar({ isOpen, onClose }: AuthSidebarProps) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setIsSubmitting(false);
      setResetRequested(false);
    }
  }, [isOpen]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setResetRequested(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === 'forgot') {
      setIsSubmitting(true);
      await requestPasswordResetAction(email);
      setIsSubmitting(false);
      setResetRequested(true);
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    const result = mode === 'login' ? await login(email, password) : await register(fullName, email, password);

    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error ?? (mode === 'login' ? 'No se ha podido iniciar sesión.' : 'No se ha podido crear la cuenta.'));
      return;
    }

    setIsSubmitting(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    onClose();
  }

  const titles: Record<AuthMode, string> = {
    login: 'Accede a tu cuenta',
    register: 'Crea tu cuenta',
    forgot: 'Recupera tu contraseña',
  };
  const eyebrows: Record<AuthMode, string> = {
    login: 'Inicio sesión',
    register: 'Crear cuenta',
    forgot: 'Recuperar acceso',
  };

  return (
    <>
      <div className={styles.overlay} data-open={isOpen} onClick={onClose} aria-hidden="true" />

      <aside className={styles.sidebar} data-open={isOpen} aria-hidden={!isOpen}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{eyebrows[mode]}</span>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <h2 className={styles.title}>{titles[mode]}</h2>

        {mode === 'forgot' && resetRequested ? (
          <div className={styles.confirmation} role="status">
            <p>
              Si existe una cuenta con el email <strong>{email}</strong>, te hemos enviado un enlace para
              restablecer tu contraseña. Revisa también la carpeta de spam.
            </p>
            <button type="button" className={styles.switchLink} onClick={() => switchMode('login')}>
              Volver a inicio de sesión
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className={styles.field}>
                <span className={styles.label}>Nombre completo</span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className={styles.input}
                  placeholder="Escribe tu nombre completo"
                  autoComplete="name"
                />
              </label>
            )}

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

            {mode !== 'forgot' && (
              <label className={styles.field}>
                <span className={styles.label}>Contraseña</span>
                <input
                  type="password"
                  required
                  minLength={mode === 'register' ? 6 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={styles.input}
                  placeholder="Escribe tu contraseña"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>
            )}

            {mode === 'register' && (
              <label className={styles.field}>
                <span className={styles.label}>Repite la contraseña</span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={styles.input}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                />
              </label>
            )}

            {mode === 'login' && (
              <button type="button" className={styles.forgot} onClick={() => switchMode('forgot')}>
                ¿Has olvidado tu contraseña?
              </button>
            )}

            {mode === 'forgot' && (
              <p className={styles.helperText}>
                Escribe el email de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.
              </p>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'login'
                  ? 'Entrando...'
                  : mode === 'register'
                    ? 'Creando cuenta...'
                    : 'Enviando enlace...'
                : mode === 'login'
                  ? 'Iniciar sesión'
                  : mode === 'register'
                    ? 'Crear cuenta'
                    : 'Enviar enlace'}
            </button>
          </form>
        )}

        {mode !== 'forgot' && (
          <p className={styles.switch}>
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button type="button" className={styles.switchLink} onClick={() => switchMode('register')}>
                  Regístrate para acceder
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button type="button" className={styles.switchLink} onClick={() => switchMode('login')}>
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        )}
      </aside>
    </>
  );
}