import Image from 'next/image';
import type { CartItem } from '@/context/CartContext';
import { formatPrice } from '@/lib/currency';
import styles from './OrderSummary.module.css';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost?: number;
}

export default function OrderSummary({ items, subtotal, shippingCost }: OrderSummaryProps) {
  const total = subtotal + (shippingCost ?? 0);

  return (
    <aside className={styles.summary}>
      <h2 className={styles.title}>Resumen del pedido</h2>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.line}>
            <div className={styles.imageWrapper}>
              <Image src={item.image} alt={item.name} fill sizes="56px" className={styles.image} />
              <span className={styles.quantity}>{item.quantity}</span>
            </div>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.price}>{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Envío</span>
          <span>
            {shippingCost === undefined
              ? 'Se calcula en el siguiente paso'
              : shippingCost === 0
                ? 'Gratis'
                : formatPrice(shippingCost)}
          </span>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </aside>
  );
}