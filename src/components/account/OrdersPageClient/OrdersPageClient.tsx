'use client';

import Link from 'next/link';
import { useOrders } from '@/context/OrdersContext';
import { formatPrice } from '@/lib/currency';
import styles from './OrdersPageClient.module.css';

const STATUS_LABELS: Record<string, string> = {
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OrdersPageClient() {
  const { orders, hydrated } = useOrders();

  // Evita parpadear "vacio" antes de leer localStorage.
  if (!hydrated) return null;

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Todavía no tienes pedidos</h1>
        <p className={styles.emptyText}>Cuando completes una compra, aparecerá aquí.</p>
        <Link href="/" className={styles.emptyCta}>
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        Mis pedidos <span className={styles.count}>({orders.length})</span>
      </h1>

      <div className={styles.list}>
        {orders.map((order) => {
          const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
          return (
            <Link key={order.orderNumber} href={`/account/orders/${order.orderNumber}`} className={styles.row}>
              <div className={styles.mainInfo}>
                <span className={styles.orderNumber}>{order.orderNumber}</span>
                <span className={styles.date}>{formatDate(order.createdAt)}</span>
              </div>
              <span className={styles.status} data-status={order.status}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className={styles.itemCount}>
                {totalItems} artículo{totalItems === 1 ? '' : 's'}
              </span>
              <span className={styles.total}>{formatPrice(order.total)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}