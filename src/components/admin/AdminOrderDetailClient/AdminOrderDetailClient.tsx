'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminOrderDetail } from '@/lib/actions/admin/orders.actions';
import type { OrderStatus } from '@/types/order.types';
import { formatPrice } from '@/lib/currency';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect/OrderStatusSelect';
import styles from './AdminOrderDetailClient.module.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AdminOrderDetailClient({ order: initialOrder }: { order: AdminOrderDetail }) {
  const [status, setStatus] = useState<OrderStatus>(initialOrder.status);
  const order = initialOrder;

  return (
    <div className={styles.page}>
      <Link href="/admin/orders" className={styles.back}>
        ← Volver a pedidos
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedido {order.orderNumber}</h1>
          <p className={styles.subtitle}>
            {order.email}
            {order.isGuest && <span className={styles.guestBadge}>Invitado</span>}
            {' · '}
            {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusSelect orderNumber={order.orderNumber} status={status} onChange={setStatus} />
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
          <span className={styles.cardValue}>{order.shippingAddress.fullName}</span>
          <span className={styles.cardSubvalue}>{order.shippingAddress.phone ?? '—'}</span>
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