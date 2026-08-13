import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductsByCategory, productCategories } from '@/data/products.config';
import CatalogHeader from '@/components/product/CatalogHeader/CatalogHeader';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';

interface CategoryPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = productCategories.find((item) => item.slug === params.slug);
  if (!category) return {};
  return { title: category.label };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = productCategories.find((item) => item.slug === params.slug);
  if (!category) notFound();

  const products = getProductsByCategory(category.slug);

  return (
    <>
      <CatalogHeader title={category.label} resultsCount={products.length} />
      <ProductGrid
        products={products}
        emptyMessage="Todavía no hay productos en esta categoría."
      />
    </>
  );
}