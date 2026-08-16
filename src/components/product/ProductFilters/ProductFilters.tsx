'use client';

import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FilterGroup, SortOption } from '@/lib/product-filters';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
  filterGroups: FilterGroup[];
  priceRange: { min: number; max: number };
}

const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevancia',
  'price-asc': 'Precio: menor a mayor',
  'price-desc': 'Precio: mayor a menor',
  'name-asc': 'Nombre (A-Z)',
};

export default function ProductFilters({ filterGroups, priceRange }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  const currentSort = (searchParams.get('sort') as SortOption) || 'relevance';
  const inStockOnly = searchParams.get('inStock') === '1';

  // Clona los searchParams actuales, aplica el cambio y navega -> es lo que
  // hace que el filtrado siga viviendo en el Server Component de la pagina.
const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete('page'); // cualquier cambio de filtro reinicia a la primera pagina
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    pushParams((params) => {
      if (event.target.value === 'relevance') params.delete('sort');
      else params.set('sort', event.target.value);
    });
  }

  function handleStockChange(event: ChangeEvent<HTMLInputElement>) {
    pushParams((params) => {
      if (event.target.checked) params.set('inStock', '1');
      else params.delete('inStock');
    });
  }

  function handleVariantToggle(groupId: string, option: string, checked: boolean) {
    pushParams((params) => {
      const current = params.get(groupId)?.split(',').filter(Boolean) ?? [];
      const next = checked ? [...current, option] : current.filter((value) => value !== option);
      if (next.length === 0) params.delete(groupId);
      else params.set(groupId, next.join(','));
    });
  }

  function handlePriceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushParams((params) => {
      if (minPrice) params.set('minPrice', minPrice);
      else params.delete('minPrice');
      if (maxPrice) params.set('maxPrice', maxPrice);
      else params.delete('maxPrice');
    });
  }

  function handleClear() {
    const params = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) params.set('q', query);
    setMinPrice('');
    setMaxPrice('');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const hasActiveFilters =
    inStockOnly ||
    currentSort !== 'relevance' ||
    Boolean(searchParams.get('minPrice')) ||
    Boolean(searchParams.get('maxPrice')) ||
    filterGroups.some((group) => Boolean(searchParams.get(group.id)));

  return (
    <div className={styles.filters}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filtros</h2>
        {hasActiveFilters && (
          <button type="button" className={styles.clear} onClick={handleClear}>
            Limpiar
          </button>
        )}
      </div>

      <div className={styles.group}>
        <label className={styles.groupLabel} htmlFor="sort-select">
          Ordenar por
        </label>
        <select id="sort-select" className={styles.select} value={currentSort} onChange={handleSortChange}>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <option key={option} value={option}>
              {SORT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.checkboxRow}>
          <input type="checkbox" checked={inStockOnly} onChange={handleStockChange} />
          <span>Solo disponibles</span>
        </label>
      </div>

      {priceRange.max > priceRange.min && (
        <form className={styles.group} onSubmit={handlePriceSubmit}>
          <span className={styles.groupLabel}>
            Precio ({priceRange.min}–{priceRange.max} EUR)
          </span>
          <div className={styles.priceRow}>
            <input
              type="number"
              inputMode="numeric"
              min={priceRange.min}
              max={priceRange.max}
              placeholder="Min"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className={styles.priceInput}
              aria-label="Precio mínimo"
            />
            <span aria-hidden="true">–</span>
            <input
              type="number"
              inputMode="numeric"
              min={priceRange.min}
              max={priceRange.max}
              placeholder="Max"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className={styles.priceInput}
              aria-label="Precio máximo"
            />
          </div>
          <button type="submit" className={styles.apply}>
            Aplicar
          </button>
        </form>
      )}

      {filterGroups.map((group) => {
        const selected = searchParams.get(group.id)?.split(',').filter(Boolean) ?? [];
        return (
          <div key={group.id} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            <div className={styles.optionsList}>
              {group.options.map((option) => (
                <label key={option} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={(event) => handleVariantToggle(group.id, option, event.target.checked)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}