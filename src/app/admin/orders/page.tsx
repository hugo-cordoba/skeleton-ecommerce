import type { Metadata } from 'next';
import { getAdminOrders } from '@/lib/actions/admin/orders.actions';
import OrdersPageClient from '@/components/admin/OrdersPageClient/OrdersPageClient';
import type { OrderStatus } from '@/types/order.types';

export const metadata: Metadata = {
  title: 'Pedidos',
};

const VALID_STATUSES: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];

interface AdminOrdersPageProps {
  searchParams: { status?: string; q?: string; page?: string };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const status = VALID_STATUSES.includes(searchParams.status as OrderStatus)
    ? (searchParams.status as OrderStatus)
    : undefined;

  const result = await getAdminOrders({
    status,
    query: searchParams.q,
    page: Number(searchParams.page) || 1,
  });

  return <OrdersPageClient result={result} status={status} query={searchParams.q ?? ''} />;
}