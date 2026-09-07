import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  Clock,
  FolderTree,
  Package,
  ShoppingBag,
  Tag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';
import type { DashboardStats } from '@/lib/actions/admin/dashboard.actions';
import type { OrderStatus } from '@/types/order.types';
import styles from './DashboardOverview.module.css';

const STATUS_LABELS: Record<OrderStatus, string> = {
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

const quickLinks = [
  { label: 'Productos', href: '/admin/products', icon: Package },
  { label: 'Categorías', href: '/admin/categories', icon: FolderTree },
  { label: 'Marcas', href: '/admin/brands', icon: Tag },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
];

export default function DashboardOverview({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: 'Ingresos hoy',
      value: formatPrice(stats.todayRevenue),
      sub: `${stats.todayOrderCount} pedido${stats.todayOrderCount === 1 ? '' : 's'}`,
      icon: TrendingUp,
    },
    {
      label: 'Ingresos esta semana',
      value: formatPrice(stats.weekRevenue),
      sub: `${stats.weekOrderCount} pedido${stats.weekOrderCount === 1 ? '' : 's'}`,
      icon: TrendingUp,
    },
    {
      label: 'Pedidos pendientes',
      value: String(stats.pendingOrderCount),
      sub: 'En preparación',
      icon: Clock,
      href: '/admin/orders?status=processing',
    },
    {
      label: 'Stock bajo',
      value: String(stats.lowStockProducts.length),
      sub: 'Productos activos',
      icon: AlertTriangle,
    },
    {
      label: 'Productos activos',
      value: String(stats.totalActiveProducts),
      sub: 'En el catálogo',
      icon: Package,
      href: '/admin/products',
    },
    {
      label: 'Clientes',
      value: String(stats.totalCustomers),
      sub: 'Cuentas registradas',
      icon: Users,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.cardsGrid}>
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{card.label}</span>
                <Icon className={styles.cardIcon} aria-hidden="true" />
              </div>
              <span className={styles.cardValue}>{card.value}</span>
              <span className={styles.cardSub}>{card.sub}</span>
            </>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className={styles.card}>
              {content}
            </Link>
          ) : (
            <div key={card.label} className={styles.card}>
              {content}
            </div>
          );
        })}
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Pedidos recientes</h2>
            <Link href="/admin/orders" className={styles.panelLink}>
              Ver todos
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className={styles.empty}>Todavía no hay pedidos.</p>
          ) : (
            <ul className={styles.list}>
              {stats.recentOrders.map((order) => (
                <li key={order.orderNumber} className={styles.orderRow}>
                  <Link href={`/admin/orders/${order.orderNumber}`} className={styles.orderLink}>
                    {order.orderNumber}
                  </Link>
                  <span className={styles.listMuted}>
                    {order.email}
                    {order.isGuest && <span className={styles.guestBadge}>Invitado</span>}
                  </span>
                  <span className={styles.listMuted}>{formatDate(order.createdAt)}</span>
                  <span className={styles.statusBadge} data-status={order.status}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className={styles.listTotal}>{formatPrice(order.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Stock bajo</h2>
            <Link href="/admin/products" className={styles.panelLink}>
              Ver productos
            </Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <p className={styles.empty}>Ningún producto activo tiene el stock bajo ahora mismo.</p>
          ) : (
            <ul className={styles.list}>
              {stats.lowStockProducts.map((product) => (
                <li key={product.id} className={styles.stockRow}>
                  <div className={styles.productCell}>
                    <div className={styles.thumbWrapper}>
                      <Image src={product.image} alt="" fill sizes="36px" className={styles.thumb} />
                    </div>
                    <Link href={`/admin/products/${product.id}`} className={styles.orderLink}>
                      {product.name}
                    </Link>
                  </div>
                  <span className={product.stock === 0 ? styles.stockZero : styles.listMuted}>
                    {product.stock} unidad{product.stock === 1 ? '' : 'es'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.quickLinks}>
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={styles.quickLink}>
              <Icon className={styles.quickLinkIcon} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}