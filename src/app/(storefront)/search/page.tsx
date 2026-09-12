import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ProductCatalog from '@/components/product/ProductCatalog/ProductCatalog';
import SearchDropdown from '@/components/product/SearchDropdown/SearchDropdown';
import { searchProducts } from '@/data/products.config';
import {
  filterAndSortProducts,
  getAvailableFilterGroups,
  getPriceRange,
  parseFilterParams,
} from '@/lib/product-filters';
import { paginate, parsePageParam } from '@/lib/pagination';
import styles from './SearchPage.module.css';

export const metadata: Metadata = {
  title: 'Buscar',
};

interface SearchPageProps {
  searchParams: { q?: string; [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';

  // Sin termino de busqueda no hay nada que pintar aqui: en vez de una
  // pagina de busqueda vacia, se manda directamente a home.
  if (!query) {
    redirect('/');
  }

  const allResults = await searchProducts(query);
  const filterGroups = getAvailableFilterGroups(allResults);
  const priceRange = getPriceRange(allResults);

  const filters = parseFilterParams(searchParams);
  const filteredResults = filterAndSortProducts(allResults, filters);

  const page = parsePageParam(searchParams);
  const { items: pagedResults, currentPage, totalPages } = paginate(filteredResults, page);

  return (
    <>
      <SearchDropdown inline defaultValue={query} key={query} />

      <h1 className={styles.resultsCount}>
        {query.toUpperCase()} <span>{filteredResults.length}</span>
      </h1>

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
    </>
  );
}