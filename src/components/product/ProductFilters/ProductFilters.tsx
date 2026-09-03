'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { SortOption } from '@/lib/product-filters';
import styles from './ProductFilters.module.css';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name-asc', label: 'Nombre (A-Z)' },
];

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const sortParam = searchParams.get('sort');
  const currentSort = (sortParam as SortOption) || 'relevance';
  const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || 'Relevancia';
  const hasSelection = sortParam !== null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function handleSortChange(value: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  }

  return (
    <div className={styles.sortWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ordenar productos"
        aria-expanded={isOpen}
      >
        <span className={styles.sortLabel}>
          {hasSelection ? currentLabel : 'Ordenar por'}
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          viewBox="0 0 20 20"
          width="13"
          height="13"
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.dropdownItem} ${currentSort === option.value ? styles.dropdownItemActive : ''}`}
              onClick={() => handleSortChange(option.value)}
            >
              {option.label}
              {currentSort === option.value && (
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}