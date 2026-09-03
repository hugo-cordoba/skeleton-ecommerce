import type { ProductDetail } from '@/types/product.types';
import type { FilterGroup } from '@/lib/product-filters';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import Pagination from '@/components/product/Pagination/Pagination';
import styles from './ProductCatalog.module.css';

type SearchParams = { [key: string]: string | string[] | undefined };

interface ProductCatalogProps {
  products: ProductDetail[];
  resultsCount: number;
  emptyMessage: string;
  filterGroups: FilterGroup[];
  priceRange: { min: number; max: number };
  currentPage: number;
  totalPages: number;
  pathname: string;
  searchParams: SearchParams;
}

export default function ProductCatalog({
  products,
  emptyMessage,
  currentPage,
  totalPages,
  pathname,
  searchParams,
}: ProductCatalogProps) {
  return (
    <div className={styles.wrapper}>
      <ProductGrid products={products} emptyMessage={emptyMessage} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pathname={pathname}
        searchParams={searchParams}
      />
    </div>
  );
}