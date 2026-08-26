import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductsByCategory, productCategories } from '@/data/products.config';
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

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams() {
  const categories = await productCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await productCategories();
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) return {};
  return { title: category.label };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categories = await productCategories();
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) notFound();

  const allProducts = await getProductsByCategory(category.slug);
  const filterGroups = getAvailableFilterGroups(allProducts);
  const priceRange = getPriceRange(allProducts);

  const filters = parseFilterParams(searchParams);
  const filteredProducts = filterAndSortProducts(allProducts, filters);

  const page = parsePageParam(searchParams);
  const { items: pagedProducts, currentPage, totalPages } = paginate(filteredProducts, page);

  return (
    <>
      <CatalogHeader title={category.label} resultsCount={filteredProducts.length} />
      <CatalogLayout
        filters={
          <Suspense fallback={null}>
            <ProductFilters filterGroups={filterGroups} priceRange={priceRange} />
          </Suspense>
        }
      >
        <ProductGrid products={pagedProducts} emptyMessage="No hay productos que coincidan con estos filtros." />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pathname={`/category/${category.slug}`}
          searchParams={searchParams}
        />
      </CatalogLayout>
    </>
  );
}