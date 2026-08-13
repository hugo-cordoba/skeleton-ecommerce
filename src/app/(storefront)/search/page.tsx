import type { Metadata } from 'next';
import CatalogHeader from '@/components/product/CatalogHeader/CatalogHeader';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import SearchForm from '@/components/product/SearchForm/SearchForm';
import { searchProducts } from '@/data/products.config';

export const metadata: Metadata = {
  title: 'Buscar',
};

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() ?? '';
  const hasQuery = query.length > 0;
  const results = hasQuery ? searchProducts(query) : [];

  return (
    <>
      <CatalogHeader
        title="Buscar"
        description={hasQuery ? undefined : 'Escribe el nombre de un producto o una categoría.'}
        resultsCount={hasQuery ? results.length : undefined}
      />
      <SearchForm defaultValue={query} />

      {hasQuery && (
        <ProductGrid
          products={results}
          emptyMessage={`No hemos encontrado nada para "${query}". Prueba con otra palabra.`}
        />
      )}
    </>
  );
}