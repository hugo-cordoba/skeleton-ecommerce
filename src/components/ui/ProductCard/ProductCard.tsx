'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product.types';
import { useCart } from '@/context/CartContext';
import WishlistButton from '@/components/ui/WishlistButton/WishlistButton';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart() {
    addItem(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  const content = (
    <>
      <div className={styles.imageWrapper}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 60vw, 320px"
          className={styles.image}
        />
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>{product.price}</p>
      </div>
    </>
  );

  return (
    <div className={styles.cardWrapper}>
      {product.href ? (
        <Link href={product.href} className={styles.card}>
          {content}
        </Link>
      ) : (
        <div className={styles.card}>{content}</div>
      )}
      <WishlistButton product={product} />

      {/* Fuera del <Link> a propósito (mismo patrón que WishlistButton):
          un <button> dentro de un <a> no es válido en HTML. Este wrapper
          replica el aspect-ratio de la imagen y deja pasar los clics
          (pointer-events: none) salvo sobre el propio botón. */}
      <div className={styles.addToCartWrapper}>
        <button
          type="button"
          className={`${styles.addToCartButton} ${justAdded ? styles.addToCartButtonPop : ''}`}
          onClick={handleAddToCart}
          aria-label={`Añadir ${product.name} a la cesta`}
        >
          {justAdded ? (
            <span className={styles.addToCartConfirm}>
              <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
                <path
                  d="M4 10.5 8 14l8-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Añadido
            </span>
          ) : (
            'Añadir a la cesta'
          )}
        </button>
      </div>
    </div>
  );
}