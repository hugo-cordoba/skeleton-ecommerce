'use client';

import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import type { Role } from '@prisma/client';
import type { AdminCustomersResult, CustomerSummary } from '@/lib/actions/admin/customers.actions';
import Pagination from '@/components/product/Pagination/Pagination';
import styles from './CustomersPageClient.module.css';

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Administrador',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface CustomersPageClientProps {
  result: AdminCustomersResult;
  role?: Role;
  query: string;
}

export default function CustomersPageClient({ result, role, query }: CustomersPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  // El padre (Server Component) vuelve a renderizar con datos nuevos cada vez
  // que cambian los searchParams; sincronizamos el estado local por si el
  // futuro añade alguna actualización optimista en esta misma tabla.
  const [customers, setCustomers] = useState<CustomerSummary[]>(result.customers);
  const [queryInput, setQueryInput] = useState(query);

  useEffect(() => {
    setCustomers(result.customers);
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

  function handleRoleFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    updateParams({ role: event.target.value || undefined });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Clientes <span className={styles.count}>({result.totalItems})</span>
        </h1>

        <div className={styles.filters}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="search"
              placeholder="Nombre o email..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className={styles.searchInput}
            />
          </form>

          <select value={role ?? ''} onChange={handleRoleFilterChange} className={styles.roleFilter}>
            <option value="">Todos los roles</option>
            <option value="CUSTOMER">Clientes</option>
            <option value="ADMIN">Administradores</option>
          </select>
        </div>
      </div>

      {customers.length === 0 ? (
        <p className={styles.empty}>No hay clientes que coincidan con esta búsqueda.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Alta</th>
                <th>Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <Link href={`/admin/customers/${customer.id}`} className={styles.customerLink}>
                      {customer.fullName}
                    </Link>
                  </td>
                  <td className={styles.muted}>{customer.email}</td>
                  <td>
                    <span className={styles.roleBadge} data-role={customer.role}>
                      {ROLE_LABELS[customer.role]}
                    </span>
                  </td>
                  <td className={styles.muted}>{formatDate(customer.createdAt)}</td>
                  <td className={styles.muted}>{customer.orderCount}</td>
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