import type { ProductDetail } from '@/types/product.types';
import { parsePriceToNumber } from '@/lib/currency';
import { isInStock } from '@/data/products.config';

/**
 * Utilidades de filtrado y orden para listados de producto (categoria y
 * busqueda). Todo el estado de filtros vive en la URL (searchParams), asi
 * que estas funciones son puras: reciben la lista de productos + los
 * parametros ya parseados y devuelven la lista filtrada/ordenada. Esto
 * mantiene las paginas como Server Components — el unico trozo de cliente
 * es el widget `ProductFilters`, que solo lee/escribe la URL.
 */

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_OPTIONS: SortOption[] = ['relevance', 'price-asc', 'price-desc', 'name-asc'];

export interface ProductFilterState {
  sort: SortOption;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  /** clave = id del grupo de variante (ej. "talla"), valor = opciones seleccionadas (ej. ["S","M"]) */
  variantSelections: Record<string, string[]>;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: string[];
}

type SearchParams = { [key: string]: string | string[] | undefined };

/** Claves que no representan un grupo de variante y no deben tratarse como tal. */
const RESERVED_KEYS = new Set(['sort', 'minPrice', 'maxPrice', 'inStock', 'q']);

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Convierte los searchParams crudos de la URL en un estado de filtro tipado. */
export function parseFilterParams(searchParams: SearchParams): ProductFilterState {
  const sortParam = firstValue(searchParams.sort);
  const sort = SORT_OPTIONS.includes(sortParam as SortOption) ? (sortParam as SortOption) : 'relevance';

  const minPriceRaw = Number(firstValue(searchParams.minPrice));
  const maxPriceRaw = Number(firstValue(searchParams.maxPrice));

  const variantSelections: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (RESERVED_KEYS.has(key) || value === undefined) continue;
    const raw = Array.isArray(value) ? value.join(',') : value;
    variantSelections[key] = raw.split(',').filter(Boolean);
  }

  return {
    sort,
    minPrice: Number.isFinite(minPriceRaw) ? minPriceRaw : undefined,
    maxPrice: Number.isFinite(maxPriceRaw) ? maxPriceRaw : undefined,
    inStockOnly: firstValue(searchParams.inStock) === '1',
    variantSelections,
  };
}

/** Grupos de variante disponibles (Talla, Color...) a partir de la lista SIN filtrar, para no ir "encogiendo" las opciones a medida que el usuario filtra. */
export function getAvailableFilterGroups(products: ProductDetail[]): FilterGroup[] {
  const groups = new Map<string, { label: string; options: Set<string> }>();

  for (const product of products) {
    product.variants?.forEach((group) => {
      if (!groups.has(group.id)) {
        groups.set(group.id, { label: group.label, options: new Set() });
      }
      const entry = groups.get(group.id)!;
      group.options.forEach((option) => entry.options.add(option.label));
    });
  }

  return Array.from(groups.entries()).map(([id, { label, options }]) => ({
    id,
    label,
    options: Array.from(options).sort(),
  }));
}

/** Rango de precio (min/max, redondeado) de la lista de productos, para pintar los placeholders del filtro de precio. */
export function getPriceRange(products: ProductDetail[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((product) => parsePriceToNumber(product.price));
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}

export function filterAndSortProducts(products: ProductDetail[], filters: ProductFilterState): ProductDetail[] {
  const filtered = products.filter((product) => {
    const price = parsePriceToNumber(product.price);
    if (filters.minPrice !== undefined && price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    if (filters.inStockOnly && !isInStock(product)) return false;

    for (const [groupId, selected] of Object.entries(filters.variantSelections)) {
      if (selected.length === 0) continue;
      const group = product.variants?.find((candidate) => candidate.id === groupId);
      const matches = group?.options.some((option) => selected.includes(option.label));
      if (!matches) return false;
    }

    return true;
  });

  switch (filters.sort) {
    case 'price-asc':
      return [...filtered].sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));
    case 'price-desc':
      return [...filtered].sort((a, b) => parsePriceToNumber(b.price) - parsePriceToNumber(a.price));
    case 'name-asc':
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    default:
      return filtered;
  }
}
