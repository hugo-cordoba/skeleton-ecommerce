'use client';

import type { Product } from '@/types/product.types';
import { useWishlist } from '@/context/WishlistContext';
import styles from './WishlistButton.module.css';

export default function WishlistButton({ product }: { product: Product }) {
  const { isInWishlist, toggleItem } = useWishlist();
  const active = isInWishlist(product.id);

  return (
    <button
      type="button"
      className={`${styles.button} ${active ? styles.active : ''}`}
      onClick={() => toggleItem(product)}
      aria-pressed={active}
      aria-label={
        active ? `Quitar ${product.name} de la lista de deseos` : `Añadir ${product.name} a la lista de deseos`
      }
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 21s-6.7-4.35-9.3-8.2C.9 9.7 1.4 6 4.3 4.4a5 5 0 0 1 7 1.6 5 5 0 0 1 7-1.6c2.9 1.6 3.4 5.3 1.6 8.4C18.7 16.65 12 21 12 21z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
}
