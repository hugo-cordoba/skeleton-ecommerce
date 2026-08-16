import { Suspense } from 'react';
import type { Metadata } from 'next';
import CatalogHeader from '@/components/product/CatalogHeader/CatalogHeader';
import CatalogLayout from '@/components/product/CatalogLayout/CatalogLayout';
import ProductFilters from '@/components/product/ProductFilters/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import Pagination from '@/components/product/Pagination/Pagination';
import SearchForm from '@/components/product/SearchForm/SearchForm';
import { searchProducts } from '@/data/products.config';
import {
  filterAndSortProducts,
  getAvailableFilterGroups,
  getPriceRange,
  parseFilterParams,
} from '@/lib/product-filters';
import { paginate, parsePageParam } from '@/lib/pagination';

export const metadata: Metadata = {
  title: 'Buscar',
};

interface SearchPageProps {
  searchParams: { q?: string; [key: string]: string | string[] | undefined };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';
  const hasQuery = query.length > 0;

  const allResults = hasQuery ? searchProducts(query) : [];
  const filterGroups = getAvailableFilterGroups(allResults);
  const priceRange = getPriceRange(allResults);

  const filters = parseFilterParams(searchParams);
  const filteredResults = hasQuery ? filterAndSortProducts(allResults, filters) : [];

  const page = parsePageParam(searchParams);
  const { items: pagedResults, currentPage, totalPages } = paginate(filteredResults, page);

  return (
    <>
      <CatalogHeader
        title="Buscar"
        description={hasQuery ? undefined : 'Escribe el nombre de un producto o una categoría.'}
        resultsCount={hasQuery ? filteredResults.length : undefined}
      />
      <SearchForm defaultValue={query} />

      {hasQuery && (
        <CatalogLayout
          filters={
            <Suspense fallback={null}>
              <ProductFilters filterGroups={filterGroups} priceRange={priceRange} />
            </Suspense>
          }
        >
          <ProductGrid
            products={pagedResults}
            emptyMessage={`No hemos encontrado nada para "${query}". Prueba con otra palabra.`}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} pathname="/search" searchParams={searchParams} />
        </CatalogLayout>
      )}
    </>
  );
}