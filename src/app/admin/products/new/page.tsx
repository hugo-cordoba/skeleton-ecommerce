import type { Metadata } from 'next';
import { getBrandOptions, getCategoryOptions } from '@/lib/actions/admin/products.actions';
import ProductForm from '@/components/admin/ProductForm/ProductForm';

export const metadata: Metadata = {
  title: 'Nuevo producto',
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getCategoryOptions(), getBrandOptions()]);

  return <ProductForm categories={categories} brands={brands} />;
}