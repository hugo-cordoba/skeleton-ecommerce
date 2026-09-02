import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllProducts } from '@/data/products.config';
import {
  filterAndSortProducts,
  getAvailableFilterGroups,
  getPriceRange,
  parseFilterParams,
} from '@/lib/product-filters';
import { paginate, parsePageParam } from '@/lib/pagination';
import CatalogHeader from '@/components/product/CatalogHeader/CatalogHeader';
import CatalogLayout from '@/components/product/CatalogLayout/CatalogLayout';
import ProductFilters from '@/components/product/ProductFilters/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import Pagination from '@/components/product/Pagination/Pagination';

export const metadata: Metadata = {
  title: 'Todos los productos',
};

interface AllProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const allProducts = await getAllProducts();

  const filterGroups = getAvailableFilterGroups(allProducts);
  const priceRange = getPriceRange(allProducts);

  const filters = parseFilterParams(searchParams);
  const filteredProducts = filterAndSortProducts(allProducts, filters);

  const page = parsePageParam(searchParams);
  const { items: pagedProducts, currentPage, totalPages } = paginate(filteredProducts, page);

  return (
    <>
      <CatalogHeader title="Todos los productos" resultsCount={filteredProducts.length} />

      <CatalogLayout
        filters={
          <Suspense fallback={null}>
            <ProductFilters filterGroups={filterGroups} priceRange={priceRange} />
          </Suspense>
        }
      >
        <ProductGrid
          products={pagedProducts}
          emptyMessage="No hay productos que coincidan con estos filtros."
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pathname="/products"
          searchParams={searchParams}
        />
      </CatalogLayout>
    </>
  );
}
