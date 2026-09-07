import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminCustomerById } from '@/lib/actions/admin/customers.actions';
import AdminCustomerDetailClient from '@/components/admin/AdminCustomerDetailClient/AdminCustomerDetailClient';

export const metadata: Metadata = {
  title: 'Detalle del cliente',
};

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getAdminCustomerById(params.id);
  if (!customer) notFound();

  return <AdminCustomerDetailClient customer={customer} />;
}