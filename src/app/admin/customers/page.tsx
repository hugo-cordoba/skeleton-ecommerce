import type { Metadata } from 'next';
import type { Role } from '@prisma/client';
import { getAdminCustomers } from '@/lib/actions/admin/customers.actions';
import CustomersPageClient from '@/components/admin/CustomersPageClient/CustomersPageClient';

export const metadata: Metadata = {
  title: 'Clientes',
};

const VALID_ROLES: Role[] = ['CUSTOMER', 'ADMIN'];

interface AdminCustomersPageProps {
  searchParams: { role?: string; q?: string; page?: string };
}

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  const role = VALID_ROLES.includes(searchParams.role as Role) ? (searchParams.role as Role) : undefined;

  const result = await getAdminCustomers({
    role,
    query: searchParams.q,
    page: Number(searchParams.page) || 1,
  });

  return <CustomersPageClient result={result} role={role} query={searchParams.q ?? ''} />;
}