'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CartLineItem from '@/components/cart/CartLineItem/CartLineItem';
import styles from './CartPageClient.module.css';

export default function CartPageClient() {
  const { items, itemCount, subtotalFormatted, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Tu cesta está vacía</h1>
        <p className={styles.emptyText}>Todavía no has añadido ningún producto.</p>
        <Link href="/" className={styles.emptyCta}>
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.items}>
        <h1 className={styles.title}>
          Tu cesta <span className={styles.count}>({itemCount})</span>
        </h1>

        <div className={styles.list}>
          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
      </div>

      <aside className={styles.summary}>
        <h2 className={styles.summaryTitle}>Resumen</h2>

        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{subtotalFormatted}</span>
        </div>
        <p className={styles.summaryNote}>Envío e impuestos se calculan en el siguiente paso.</p>

        <Link href="/checkout/information" className={styles.checkoutButton}>
          Tramitar pedido
        </Link>

        <Link href="/" className={styles.continueLink}>
          ← Seguir comprando
        </Link>
      </aside>
    </div>
  );
}