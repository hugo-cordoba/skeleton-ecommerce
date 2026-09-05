// src/app/admin/products/new/page.tsx
import { productCategories, productBrands } from '@/data/products.config';
import ProductForm from '@/components/admin/ProductForm/ProductForm';

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([productCategories(), productBrands()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}