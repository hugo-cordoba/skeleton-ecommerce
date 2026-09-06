import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminProductById, getBrandOptions, getCategoryOptions } from '@/lib/actions/admin/products.actions';
import ProductForm from '@/components/admin/ProductForm/ProductForm';

export const metadata: Metadata = {
  title: 'Editar producto',
};

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, brands] = await Promise.all([
    getAdminProductById(params.id),
    getCategoryOptions(),
    getBrandOptions(),
  ]);

  if (!product) notFound();

  return <ProductForm product={product} categories={categories} brands={brands} />;
}