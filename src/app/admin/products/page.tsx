import type { Metadata } from 'next';
import type { ProductStatus } from '@/types/product.types';
import { getAdminProducts, getCategoryOptions } from '@/lib/actions/admin/products.actions';
import ProductsPageClient from '@/components/admin/ProductsPageClient/ProductsPageClient';

export const metadata: Metadata = {
  title: 'Productos',
};

const VALID_STATUSES: ProductStatus[] = ['ACTIVE', 'ARCHIVED'];

interface AdminProductsPageProps {
  searchParams: { status?: string; category?: string; q?: string; page?: string };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const status = VALID_STATUSES.includes(searchParams.status as ProductStatus)
    ? (searchParams.status as ProductStatus)
    : undefined;

  const [result, categories] = await Promise.all([
    getAdminProducts({
      status,
      categorySlug: searchParams.category,
      query: searchParams.q,
      page: Number(searchParams.page) || 1,
    }),
    getCategoryOptions(),
  ]);

  return (
    <ProductsPageClient
      result={result}
      categories={categories}
      status={status}
      categorySlug={searchParams.category ?? ''}
      query={searchParams.q ?? ''}
    />
  );
}