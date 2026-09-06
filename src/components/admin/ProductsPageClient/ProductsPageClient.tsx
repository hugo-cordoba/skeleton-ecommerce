'use client';

import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type {
  AdminProductsResult,
  OptionDTO,
  ProductSummary,
} from '@/lib/actions/admin/products.actions';
import { archiveProductAction, restoreProductAction } from '@/lib/actions/admin/products.actions';
import Pagination from '@/components/product/Pagination/Pagination';
import styles from './ProductsPageClient.module.css';

interface ProductsPageClientProps {
  result: AdminProductsResult;
  categories: OptionDTO[];
  status?: string;
  categorySlug: string;
  query: string;
}

export default function ProductsPageClient({
  result,
  categories,
  status,
  categorySlug,
  query,
}: ProductsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  const [products, setProducts] = useState<ProductSummary[]>(result.products);
  const [queryInput, setQueryInput] = useState(query);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setProducts(result.products);
  }, [result]);

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(nextSearchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ q: queryInput || undefined });
  }

  function handleCategoryFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    updateParams({ category: event.target.value || undefined });
  }

  function handleStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    updateParams({ status: event.target.value || undefined });
  }

  async function handleToggleStatus(product: ProductSummary) {
    setTogglingId(product.id);
    const action = product.status === 'ACTIVE' ? archiveProductAction : restoreProductAction;
    const result = await action(product.id);
    setTogglingId(null);
    if (!result.ok) return; // TODO: mostrar el error en la UI

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, status: product.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE' } : p
      )
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Productos <span className={styles.count}>({result.totalItems})</span>
        </h1>
        <Link href="/admin/products/new" className={styles.addButton}>
          + Nuevo producto
        </Link>
      </div>

      <div className={styles.filters}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="search"
            placeholder="Nombre o SKU..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className={styles.searchInput}
          />
        </form>

        <select value={categorySlug} onChange={handleCategoryFilterChange} className={styles.statusFilter}>
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
        </select>

        <select value={status ?? ''} onChange={handleStatusFilterChange} className={styles.statusFilter}>
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="ARCHIVED">Archivado</option>
        </select>
      </div>

      {products.length === 0 ? (
        <p className={styles.empty}>No hay productos que coincidan con estos filtros.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th aria-label="Imagen" />
                <th>Nombre</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.thumbWrapper}>
                      <Image src={product.image} alt="" fill sizes="48px" className={styles.thumb} />
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/products/${product.id}`} className={styles.productLink}>
                      {product.name}
                    </Link>
                  </td>
                  <td className={styles.muted}>{product.sku}</td>
                  <td className={styles.muted}>{product.categoryLabel}</td>
                  <td>{product.price}</td>
                  <td className={product.stock === 0 ? styles.stockZero : undefined}>{product.stock}</td>
                  <td>
                    <span className={styles.statusBadge} data-status={product.status}>
                      {product.status === 'ACTIVE' ? 'Activo' : 'Archivado'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(product)}
                      disabled={togglingId === product.id}
                    >
                      {product.status === 'ACTIVE' ? 'Archivar' : 'Restaurar'}
                    </button>
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