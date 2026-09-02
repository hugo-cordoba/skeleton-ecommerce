import { Suspense } from 'react';
import type { Metadata } from 'next';
import CatalogHeader from '@/components/product/CatalogHeader/CatalogHeader';
import ProductCatalog from '@/components/product/ProductCatalog/ProductCatalog';
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';
  const hasQuery = query.length > 0;

  const allResults = hasQuery ? await searchProducts(query) : [];
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
      />
      <SearchForm defaultValue={query} />

      {hasQuery && (
        <Suspense fallback={null}>
          <ProductCatalog
            products={pagedResults}
            resultsCount={filteredResults.length}
            emptyMessage={`No hemos encontrado nada para "${query}". Prueba con otra palabra.`}
            filterGroups={filterGroups}
            priceRange={priceRange}
            currentPage={currentPage}
            totalPages={totalPages}
            pathname="/search"
            searchParams={searchParams}
          />
        </Suspense>
      )}
    </>
  );
}