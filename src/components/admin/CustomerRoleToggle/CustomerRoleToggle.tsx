'use client';

import { useState, useTransition } from 'react';
import type { Role } from '@prisma/client';
import { updateCustomerRoleAction } from '@/lib/actions/admin/customers.actions';
import styles from './CustomerRoleToggle.module.css';

interface CustomerRoleToggleProps {
  userId: string;
  role: Role;
  onChange: (role: Role) => void;
  /** true si el admin que ve esta página es este mismo usuario: no puede quitarse el rol a sí mismo. */
  disableSelf?: boolean;
}

export default function CustomerRoleToggle({ userId, role, onChange, disableSelf }: CustomerRoleToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nextRole: Role = role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
  const isSelfLocked = Boolean(disableSelf) && role === 'ADMIN';

  function handleClick() {
    const confirmMessage =
      role === 'ADMIN'
        ? '¿Quitar los permisos de administrador a este usuario? Dejará de poder acceder al panel /admin.'
        : '¿Dar permisos de administrador a este usuario? Podrá acceder a todo el panel /admin.';
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    const previous = role;
    onChange(nextRole); // optimista

    startTransition(async () => {
      const result = await updateCustomerRoleAction(userId, nextRole);
      if (!result.ok) {
        onChange(previous); // revertimos si falla
        setError(result.error);
      }
    });
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        data-variant={role === 'ADMIN' ? 'danger' : 'primary'}
        onClick={handleClick}
        disabled={isPending || isSelfLocked}
        title={isSelfLocked ? 'No puedes quitarte el rol de administrador a ti mismo.' : undefined}
      >
        {isPending ? 'Guardando...' : role === 'ADMIN' ? 'Quitar administrador' : 'Hacer administrador'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}