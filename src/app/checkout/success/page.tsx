'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import { formatPrice } from '@/lib/currency';
import styles from './SuccessPage.module.css';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { completedOrder, resetCheckout } = useCheckout();

  // URL directa sin haber completado un pedido: no hay nada que mostrar.
  useEffect(() => {
    if (!completedOrder) {
      router.replace('/');
    }
  }, [completedOrder, router]);

  if (!completedOrder) return null;

  const { orderNumber, email, shippingAddress, shippingMethod, items, total } = completedOrder;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.badge}>Pedido confirmado</span>
        <h1 className={styles.title}>¡Gracias por tu compra!</h1>
        <p className={styles.subtitle}>
          Hemos enviado la confirmación a <strong>{email}</strong>.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Número de pedido</span>
          <span className={styles.cardValue}>{orderNumber}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Envío</span>
          <span className={styles.cardValue}>{shippingMethod.label}</span>
          <span className={styles.cardSubvalue}>{shippingMethod.etaLabel}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Dirección</span>
          <span className={styles.cardValue}>
            {shippingAddress.addressLine1}, {shippingAddress.city}
          </span>
          <span className={styles.cardSubvalue}>
            {shippingAddress.postalCode}, {shippingAddress.country}
          </span>
        </div>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.itemName}>
              {item.name} <span className={styles.itemQuantity}>× {item.quantity}</span>
            </span>
            <span className={styles.itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className={styles.total}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Link href="/" className={styles.cta} onClick={resetCheckout}>
        Volver a la tienda
      </Link>
    </div>
  );
}