'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Role } from '@prisma/client';
import type { AdminCustomerDetail } from '@/lib/actions/admin/customers.actions';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/currency';
import CustomerRoleToggle from '@/components/admin/CustomerRoleToggle/CustomerRoleToggle';
import styles from './AdminCustomerDetailClient.module.css';

const STATUS_LABELS: Record<string, string> = {
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Administrador',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AdminCustomerDetailClient({ customer }: { customer: AdminCustomerDetail }) {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>(customer.role);

  const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
  const isSelf = user?.id === customer.id;

  return (
    <div className={styles.page}>
      <Link href="/admin/customers" className={styles.back}>
        ← Volver a clientes
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{customer.fullName}</h1>
          <p className={styles.subtitle}>
            {customer.email} · Cliente desde {formatDate(customer.createdAt)}
          </p>
        </div>

        <div className={styles.roleArea}>
          <span className={styles.roleBadge} data-role={role}>
            {ROLE_LABELS[role]}
          </span>
          <CustomerRoleToggle userId={customer.id} role={role} onChange={setRole} disableSelf={isSelf} />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Pedidos</span>
          <span className={styles.cardValue}>{customer.orders.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total gastado</span>
          <span className={styles.cardValue}>{formatPrice(totalSpent)}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Lista de deseos</span>
          <span className={styles.cardValue}>{customer.wishlist.length}</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Direcciones guardadas</h2>
        {customer.addresses.length === 0 ? (
          <p className={styles.empty}>Este cliente no ha guardado ninguna dirección.</p>
        ) : (
          <div className={styles.addressGrid}>
            {customer.addresses.map((address) => (
              <div key={address.id} className={styles.addressCard}>
                <div className={styles.addressHeader}>
                  <span className={styles.addressLabel}>{address.label || 'Dirección'}</span>
                  {address.isDefault && <span className={styles.defaultBadge}>Predeterminada</span>}
                </div>
                <p className={styles.addressText}>{address.fullName}</p>
                <p className={styles.addressText}>
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                </p>
                <p className={styles.addressText}>
                  {address.postalCode} {address.city}, {address.country}
                </p>
                {address.phone && <p className={styles.addressText}>{address.phone}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pedidos</h2>
        {customer.orders.length === 0 ? (
          <p className={styles.empty}>Este cliente todavía no ha hecho ningún pedido.</p>
        ) : (
          <div className={styles.ordersList}>
            {customer.orders.map((order) => (
              <Link key={order.orderNumber} href={`/admin/orders/${order.orderNumber}`} className={styles.orderRow}>
                <div className={styles.orderMain}>
                  <span className={styles.orderNumber}>{order.orderNumber}</span>
                  <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                </div>
                <span className={styles.statusBadge} data-status={order.status}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <span className={styles.orderItems}>
                  {order.itemCount} artículo{order.itemCount === 1 ? '' : 's'}
                </span>
                <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Lista de deseos</h2>
        {customer.wishlist.length === 0 ? (
          <p className={styles.empty}>Este cliente no tiene productos en su lista de deseos.</p>
        ) : (
          <div className={styles.wishlistGrid}>
            {customer.wishlist.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className={styles.wishlistCard}>
                <div className={styles.wishlistImageWrapper}>
                  <Image src={item.image} alt={item.name} fill sizes="140px" className={styles.wishlistImage} />
                </div>
                <span className={styles.wishlistName}>{item.name}</span>
                <span className={styles.wishlistPrice}>{item.price}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}