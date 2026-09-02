import type { Product } from '@/types/product.types';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  emptyMessage: string;
  columns?: 4 | 7;
}

export default function ProductGrid({ products, emptyMessage, columns = 4 }: ProductGridProps) {
  if (products.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.grid} data-columns={columns}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}