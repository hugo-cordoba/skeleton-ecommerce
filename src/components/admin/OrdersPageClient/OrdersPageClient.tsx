'use client';

import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import type { AdminOrdersResult, AdminOrderSummary } from '@/lib/actions/admin/orders.actions';
import type { OrderStatus } from '@/types/order.types';
import { formatPrice } from '@/lib/currency';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect/OrderStatusSelect';
import Pagination from '@/components/product/Pagination/Pagination';
import styles from './OrdersPageClient.module.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface OrdersPageClientProps {
  result: AdminOrdersResult;
  status?: OrderStatus;
  query: string;
}

export default function OrdersPageClient({ result, status, query }: OrdersPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  // El padre (Server Component) vuelve a renderizar con datos nuevos cada vez
  // que cambian los searchParams; sincronizamos el estado local (necesario
  // para el update optimista del estado) cada vez que llega un result nuevo.
  const [orders, setOrders] = useState<AdminOrderSummary[]>(result.orders);
  const [queryInput, setQueryInput] = useState(query);

  useEffect(() => {
    setOrders(result.orders);
  }, [result]);

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(nextSearchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page'); // cualquier cambio de filtro reinicia la paginación
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ q: queryInput || undefined });
  }

  function handleStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    updateParams({ status: event.target.value || undefined });
  }

  function handleStatusChange(orderNumber: string, nextStatus: OrderStatus) {
    setOrders((prev) => prev.map((order) => (order.orderNumber === orderNumber ? { ...order, status: nextStatus } : order)));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Pedidos <span className={styles.count}>({result.totalItems})</span>
        </h1>

        <div className={styles.filters}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="search"
              placeholder="Nº de pedido o email..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className={styles.searchInput}
            />
          </form>

          <select value={status ?? ''} onChange={handleStatusFilterChange} className={styles.statusFilter}>
            <option value="">Todos los estados</option>
            <option value="processing">En preparación</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className={styles.empty}>No hay pedidos que coincidan con estos filtros.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderNumber}>
                  <td>
                    <Link href={`/admin/orders/${order.orderNumber}`} className={styles.orderLink}>
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td>
                    {order.email}
                    {order.isGuest && <span className={styles.guestBadge}>Invitado</span>}
                  </td>
                  <td className={styles.muted}>{formatDate(order.createdAt)}</td>
                  <td className={styles.muted}>{order.itemCount}</td>
                  <td className={styles.totalCell}>{formatPrice(order.total)}</td>
                  <td>
                    <OrderStatusSelect
                      orderNumber={order.orderNumber}
                      status={order.status}
                      onChange={(next) => handleStatusChange(order.orderNumber, next)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        pathname={pathname}
        searchParams={Object.fromEntries(nextSearchParams.entries())}
      />
    </div>
  );
}