// src/app/admin/products/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { getAdminProductById } from '@/lib/actions/admin/product.actions';
import { productCategories, productBrands } from '@/data/products.config';
import ProductForm from '@/components/admin/ProductForm/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, brands] = await Promise.all([
    getAdminProductById(params.id),
    productCategories(),
    productBrands(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Editar producto</h1>
      <ProductForm mode="edit" productId={product.id} initialData={product} categories={categories} brands={brands} />
    </div>
  );
}