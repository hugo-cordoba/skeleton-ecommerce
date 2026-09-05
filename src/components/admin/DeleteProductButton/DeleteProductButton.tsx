'use client';

import { useState, useTransition } from 'react';
import { deleteProductAction } from '@/lib/actions/admin/product.actions';
import styles from './DeleteProductButton.module.css';

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`)) return;

    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (!result.ok) setError(result.error ?? 'No se ha podido eliminar.');
    });
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.button} onClick={handleDelete} disabled={isPending}>
        {isPending ? 'Eliminando...' : 'Eliminar'}
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}