'use client';

import { useState } from 'react';
import type { ProductDetail } from '@/types/product.types';
import type { FilterGroup } from '@/lib/product-filters';
import ProductFilters from '@/components/product/ProductFilters/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import Pagination from '@/components/product/Pagination/Pagination';
import styles from './ProductCatalog.module.css';

type SearchParams = { [key: string]: string | string[] | undefined };
type Density = 4 | 7;

const DENSITY_OPTIONS: Density[] = [4, 7];

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
  resultsCount,
  emptyMessage,
  filterGroups,
  priceRange,
  currentPage,
  totalPages,
  pathname,
  searchParams,
}: ProductCatalogProps) {
  const [density, setDensity] = useState<Density>(4);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {resultsCount} producto{resultsCount === 1 ? '' : 's'}
        </span>

        <div className={styles.actions}>
          <div className={styles.densityToggle} role="group" aria-label="Productos por fila">
            {DENSITY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={styles.densityButton}
                data-active={density === option}
                aria-pressed={density === option}
                aria-label={`Ver ${option} productos por fila`}
                onClick={() => setDensity(option)}
              >
                {option === 4 ? (
                  <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true">
                    <rect x="2" y="2" width="7" height="7" rx="1" fill="currentColor" />
                    <rect x="11" y="2" width="7" height="7" rx="1" fill="currentColor" />
                    <rect x="2" y="11" width="7" height="7" rx="1" fill="currentColor" />
                    <rect x="11" y="11" width="7" height="7" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 21 21" width="17" height="17" aria-hidden="true">
                    <rect x="1" y="1" width="4" height="4" fill="currentColor" />
                    <rect x="8.5" y="1" width="4" height="4" fill="currentColor" />
                    <rect x="16" y="1" width="4" height="4" fill="currentColor" />
                    <rect x="1" y="8.5" width="4" height="4" fill="currentColor" />
                    <rect x="8.5" y="8.5" width="4" height="4" fill="currentColor" />
                    <rect x="16" y="8.5" width="4" height="4" fill="currentColor" />
                    <rect x="1" y="16" width="4" height="4" fill="currentColor" />
                    <rect x="8.5" y="16" width="4" height="4" fill="currentColor" />
                    <rect x="16" y="16" width="4" height="4" fill="currentColor" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <ProductFilters filterGroups={filterGroups} priceRange={priceRange} />
        </div>
      </div>

      <ProductGrid products={products} emptyMessage={emptyMessage} columns={density} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pathname={pathname}
        searchParams={searchParams}
      />
    </div>
  );
}