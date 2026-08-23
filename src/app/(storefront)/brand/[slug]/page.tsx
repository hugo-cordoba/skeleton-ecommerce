import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBrandBySlug, getProductsByBrand } from '@/data/products.config';
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

interface BrandPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export function generateMetadata({ params }: BrandPageProps): Metadata {
  const brand = getBrandBySlug(params.slug);
  if (!brand) return {};
  return { title: brand.label };
}

export default function BrandPage({ params, searchParams }: BrandPageProps) {
  const brand = getBrandBySlug(params.slug);
  if (!brand) notFound();

  const allProducts = getProductsByBrand(brand.slug);
  const filterGroups = getAvailableFilterGroups(allProducts);
  const priceRange = getPriceRange(allProducts);

  const filters = parseFilterParams(searchParams);
  const filteredProducts = filterAndSortProducts(allProducts, filters);

  const page = parsePageParam(searchParams);
  const { items: pagedProducts, currentPage, totalPages } = paginate(filteredProducts, page);

  return (
    <>
      <CatalogHeader title={brand.label} resultsCount={filteredProducts.length} />
      <CatalogLayout
        filters={
          <Suspense fallback={null}>
            <ProductFilters filterGroups={filterGroups} priceRange={priceRange} />
          </Suspense>
        }
      >
        <ProductGrid products={pagedProducts} emptyMessage="No hay productos de esta marca por ahora." />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pathname={`/brand/${brand.slug}`}
          searchParams={searchParams}
        />
      </CatalogLayout>
    </>
  );
}