import { prisma } from '@/lib/prisma';
import styles from './Dashboard.module.css';

export default async function AdminDashboardPage() {
  // Sin scope de usuario: aqui es donde el admin empieza a hablar
  // directamente con Prisma, a diferencia de los server actions "de
  // cliente" (cart/wishlist/order.actions.ts), que siempre filtran por
  // userId/guestId.
  const [productCount, orderCount, pendingOrderCount, lowStockCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
  ]);

  const cards = [
    { label: 'Productos', value: productCount },
    { label: 'Pedidos totales', value: orderCount },
    { label: 'Pedidos en preparación', value: pendingOrderCount },
    { label: 'Productos con poco stock (≤5)', value: lowStockCount },
  ];

  return (
    <div>
      <h1 className={styles.title}>Resumen</h1>
      <div className={styles.grid}>
        {cards.map((card) => (
          <div key={card.label} className={styles.card}>
            <span className={styles.cardLabel}>{card.label}</span>
            <span className={styles.cardValue}>{card.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}