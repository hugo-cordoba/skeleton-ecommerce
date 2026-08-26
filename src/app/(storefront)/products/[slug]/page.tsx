import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/data/products.config';
import ProductCarousel from '@/components/sections/ProductCarousel/ProductCarousel';
import ProductDetailClient from '@/components/product/ProductDetailClient/ProductDetailClient';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription ?? product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product);

  return (
    <>
      <ProductDetailClient product={product} />

      {relatedProducts.length > 0 && (
        <ProductCarousel
          title="También te puede interesar"
          items={relatedProducts}
          promos={[]}
        />
      )}
    </>
  );
}