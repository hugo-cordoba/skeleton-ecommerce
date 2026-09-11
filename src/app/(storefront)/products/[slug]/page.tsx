import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/data/products.config';
import ProductCarousel from '@/components/sections/ProductCarousel/ProductCarousel';
import ProductDetailClient from '@/components/product/ProductDetailClient/ProductDetailClient';
import styles from './ProductPage.module.css';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product || product.status === 'ARCHIVED') return {};

  return {
    title: product.name,
    description: product.shortDescription ?? product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  // Un producto archivado sigue en BD por los pedidos históricos, pero para
  // el escaparate es como si no existiera.
  if (!product || product.status === 'ARCHIVED') notFound();

  const relatedProducts = await getRelatedProducts(product);

  return (
    <div className={styles.page}>
      <ProductDetailClient product={product} />

      {relatedProducts.length > 0 && (
        <ProductCarousel
          title="También te puede interesar"
          items={relatedProducts}
          promos={[]}
          className={styles.related}
        />
      )}
    </div>
  );
}