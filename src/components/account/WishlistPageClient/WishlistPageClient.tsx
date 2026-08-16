'use client';

import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import styles from './WishlistPageClient.module.css';

export default function WishlistPageClient() {
  const { items, hydrated } = useWishlist();

  // Evita parpadeo mostrando "vacia" antes de leer localStorage.
  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Tu lista de deseos está vacía</h1>
        <p className={styles.emptyText}>Guarda aquí los productos que te interesen para encontrarlos más tarde.</p>
        <Link href="/" className={styles.emptyCta}>
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        Lista de deseos <span className={styles.count}>({items.length})</span>
      </h1>
      <ProductGrid products={items} emptyMessage="" />
    </div>
  );
}