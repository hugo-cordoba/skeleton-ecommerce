'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/context/OrdersContext';
import { formatPrice } from '@/lib/currency';
import styles from './OrderDetailClient.module.css';

const STATUS_LABELS: Record<string, string> = {
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OrderDetailClient({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const { getOrder, hydrated } = useOrders();
  const order = hydrated ? getOrder(orderNumber) : undefined;

  // Id invalido o pedido de otro usuario: no hay nada que mostrar.
  useEffect(() => {
    if (hydrated && !order) {
      router.replace('/account/orders');
    }
  }, [hydrated, order, router]);

  if (!hydrated || !order) return null;

  return (
    <div className={styles.page}>
      <Link href="/account/orders" className={styles.back}>
        ← Volver a mis pedidos
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedido {order.orderNumber}</h1>
          <p className={styles.subtitle}>{formatDate(order.createdAt)}</p>
        </div>
        <span className={styles.status} data-status={order.status}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Envío</span>
          <span className={styles.cardValue}>{order.shippingMethod.label}</span>
          <span className={styles.cardSubvalue}>{order.shippingMethod.etaLabel}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Dirección</span>
          <span className={styles.cardValue}>
            {order.shippingAddress.addressLine1}, {order.shippingAddress.city}
          </span>
          <span className={styles.cardSubvalue}>
            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Contacto</span>
          <span className={styles.cardValue}>{order.email}</span>
        </div>
      </div>

      <div className={styles.items}>
        {order.items.map((item) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.itemName}>
              {item.name} <span className={styles.itemQuantity}>× {item.quantity}</span>
            </span>
            <span className={styles.itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}

        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Envío</span>
          <span>{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
        </div>
        <div className={styles.total}>
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}