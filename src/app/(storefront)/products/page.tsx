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
import ProductFilters from '@/components/product/ProductFilters/ProductFilters';
import ProductCatalog from '@/components/product/ProductCatalog/ProductCatalog';

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
      <CatalogHeader title="Todos los productos" actions={<ProductFilters />} />

      <Suspense fallback={null}>
        <ProductCatalog
          products={pagedProducts}
          resultsCount={filteredProducts.length}
          emptyMessage="No hay productos que coincidan con estos filtros."
          filterGroups={filterGroups}
          priceRange={priceRange}
          currentPage={currentPage}
          totalPages={totalPages}
          pathname="/products"
          searchParams={searchParams}
        />
      </Suspense>
    </>
  );
}