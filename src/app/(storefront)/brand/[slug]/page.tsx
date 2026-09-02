import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllBrandSlugs, getBrandBySlug, getProductsByBrand } from '@/data/products.config';
import {
  filterAndSortProducts,
  getAvailableFilterGroups,
  getPriceRange,
  parseFilterParams,
} from '@/lib/product-filters';
import { paginate, parsePageParam } from '@/lib/pagination';
import CatalogHeader from '@/components/product/CatalogHeader/CatalogHeader';
import ProductCatalog from '@/components/product/ProductCatalog/ProductCatalog';

interface BrandPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllBrandSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) return {};
  return { title: brand.label };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) notFound();

  const allProducts = await getProductsByBrand(brand.slug);
  const filterGroups = getAvailableFilterGroups(allProducts);
  const priceRange = getPriceRange(allProducts);

  const filters = parseFilterParams(searchParams);
  const filteredProducts = filterAndSortProducts(allProducts, filters);

  const page = parsePageParam(searchParams);
  const { items: pagedProducts, currentPage, totalPages } = paginate(filteredProducts, page);

  return (
    <>
      <CatalogHeader title={brand.label} />

      <Suspense fallback={null}>
        <ProductCatalog
          products={pagedProducts}
          resultsCount={filteredProducts.length}
          emptyMessage="No hay productos de esta marca por ahora."
          filterGroups={filterGroups}
          priceRange={priceRange}
          currentPage={currentPage}
          totalPages={totalPages}
          pathname={`/brand/${brand.slug}`}
          searchParams={searchParams}
        />
      </Suspense>
    </>
  );
}