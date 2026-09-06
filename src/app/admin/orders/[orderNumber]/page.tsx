import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminOrderDetail } from '@/lib/actions/admin/orders.actions';
import AdminOrderDetailClient from '@/components/admin/AdminOrderDetailClient/AdminOrderDetailClient';

export const metadata: Metadata = {
  title: 'Detalle del pedido',
};

export default async function AdminOrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const order = await getAdminOrderDetail(params.orderNumber);
  if (!order) notFound();

  return <AdminOrderDetailClient order={order} />;
}