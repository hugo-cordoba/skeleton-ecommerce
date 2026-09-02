'use client';

import { useState } from 'react';
import type { Product } from '@/types/product.types';
import { useWishlist } from '@/context/WishlistContext';
import styles from './WishlistButton.module.css';

const HEART_PATH =
  'M12 21s-6.7-4.35-9.3-8.2C.9 9.7 1.4 6 4.3 4.4a5 5 0 0 1 7 1.6 5 5 0 0 1 7-1.6c2.9 1.6 3.4 5.3 1.6 8.4C18.7 16.65 12 21 12 21z';

export default function WishlistButton({ product }: { product: Product }) {
  const { isInWishlist, toggleItem } = useWishlist();
  const active = isInWishlist(product.id);
  const [isAnimating, setIsAnimating] = useState(false);
  // Se incrementa en cada "añadido" para forzar el remount del halo y
  // que la animación se reproduzca de nuevo (con solo una clase no
  // volvería a reproducirse en clics consecutivos).
  const [pulseId, setPulseId] = useState(0);

  function handleClick() {
    if (!active) {
      setIsAnimating(true);
      setPulseId((id) => id + 1);
    }
    toggleItem(product);
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${active ? styles.active : ''} ${isAnimating ? styles.pop : ''}`}
      onClick={handleClick}
      onAnimationEnd={(event) => {
        // Ignora el animationend que burbujea desde el halo (el corazón
        // hijo); solo nos interesa el del propio botón.
        if (event.target === event.currentTarget) setIsAnimating(false);
      }}
      aria-pressed={active}
      aria-label={
        active ? `Quitar ${product.name} de la lista de deseos` : `Añadir ${product.name} a la lista de deseos`
      }
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d={HEART_PATH} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" />
      </svg>

      {pulseId > 0 && (
        <svg key={pulseId} className={styles.halo} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d={HEART_PATH} fill="currentColor" />
        </svg>
      )}
    </button>
  );
}