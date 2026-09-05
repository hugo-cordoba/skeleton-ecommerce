import { productCategories, productBrands } from '@/data/products.config';
import ProductForm from '@/components/admin/ProductForm/ProductForm';
import styles from '../AdminProducts.module.css';

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([productCategories(), productBrands()]);

  return (
    <div>
      <h1 className={styles.title}>Nuevo producto</h1>
      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}