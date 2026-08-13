import type { ProductDetail } from '@/types/product.types';

/**
 * FICHERO COMUN: fuente unica de datos de producto para todo el sitio
 * (PDP, categoria, carrito, buscador, relacionados...). Hoy es un
 * array en memoria; el dia que haya backend/CMS, solo hay que
 * sustituir el contenido de `products` (y el cuerpo de las funciones
 * de abajo, ej. por llamadas fetch/API) sin tocar los componentes que
 * ya consumen estas funciones — ese es justo el mismo patron que
 * `landing.config.ts` usa para las secciones de la home.
 *
 * Los datos son PLACEHOLDER (mismo criterio que `landing.config.ts`):
 * sustituye nombres, descripciones, imagenes, precios y stock por los
 * reales del cliente cuando toque personalizar la tienda.
 */

/**
 * Categorias validas, en el mismo texto que ya usa CategoryGrid en
 * landing.config.ts ("Categoria 1"..."Categoria 4"). Al tener slug,
 * sirven tanto para `category/[slug]/page.tsx` como para relacionar
 * productos entre si.
 */
export const productCategories = [
  { slug: 'categoria-1', label: 'Categoria 1' },
  { slug: 'categoria-2', label: 'Categoria 2' },
  { slug: 'categoria-3', label: 'Categoria 3' },
  { slug: 'categoria-4', label: 'Categoria 4' },
] as const;

export const products: ProductDetail[] = [
  {
    id: 'prod-01',
    slug: 'producto-1',
    name: 'Producto 1',
    price: '19,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+1',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+1',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+1+vista+2',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+1+vista+3',
    ],
    href: '/products/producto-1',
    badge: 'Nuevo',
    description:
      'Descripcion larga de ejemplo para el Producto 1. Sustituye este texto por la descripcion real: materiales, cuidados, medidas y cualquier detalle que ayude a decidir la compra.',
    shortDescription: 'Descripcion corta de una linea para listados y tarjetas.',
    categorySlug: 'categoria-1',
    categoryLabel: 'Categoria 1',
    sku: 'SKU-P01',
    stock: 12,
    variants: [
      {
        id: 'talla',
        label: 'Talla',
        options: [
          { id: 's', label: 'S', available: true },
          { id: 'm', label: 'M', available: true },
          { id: 'l', label: 'L', available: false },
        ],
      },
    ],
  },
  {
    id: 'prod-02',
    slug: 'producto-2',
    name: 'Producto 2',
    price: '24,90 EUR',
    compareAtPrice: '34,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+2',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+2',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+2+vista+2',
    ],
    href: '/products/producto-2',
    badge: 'Oferta',
    description:
      'Descripcion larga de ejemplo para el Producto 2, en oferta. Aqui iria el texto real explicando por que este producto merece la pena frente a otros similares.',
    shortDescription: 'En oferta por tiempo limitado.',
    categorySlug: 'categoria-1',
    categoryLabel: 'Categoria 1',
    sku: 'SKU-P02',
    stock: 8,
    variants: [
      {
        id: 'talla',
        label: 'Talla',
        options: [
          { id: 's', label: 'S', available: true },
          { id: 'm', label: 'M', available: true },
          { id: 'l', label: 'L', available: true },
          { id: 'xl', label: 'XL', available: true },
        ],
      },
    ],
  },
  {
    id: 'prod-03',
    slug: 'producto-3',
    name: 'Producto 3',
    price: '15,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+3',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+3',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+3+vista+2',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+3+vista+3',
    ],
    href: '/products/producto-3',
    description: 'Descripcion larga de ejemplo para el Producto 3. Texto placeholder a sustituir por cliente.',
    shortDescription: 'Descripcion corta de una linea para listados.',
    categorySlug: 'categoria-1',
    categoryLabel: 'Categoria 1',
    sku: 'SKU-P03',
    stock: 5,
    variants: [
      {
        id: 'color',
        label: 'Color',
        options: [
          { id: 'negro', label: 'Negro', available: true },
          { id: 'blanco', label: 'Blanco', available: true },
          { id: 'azul', label: 'Azul', available: false },
        ],
      },
    ],
  },
  {
    id: 'prod-04',
    slug: 'producto-4',
    name: 'Producto 4',
    price: '29,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+4',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+4',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+4+vista+2',
    ],
    href: '/products/producto-4',
    badge: 'Nuevo',
    description: 'Descripcion larga de ejemplo para el Producto 4. Texto placeholder a sustituir por cliente.',
    shortDescription: 'Descripcion corta de una linea para listados.',
    categorySlug: 'categoria-2',
    categoryLabel: 'Categoria 2',
    sku: 'SKU-P04',
    stock: 20,
    variants: [
      {
        id: 'color',
        label: 'Color',
        options: [
          { id: 'negro', label: 'Negro', available: true },
          { id: 'blanco', label: 'Blanco', available: true },
        ],
      },
    ],
  },
  {
    id: 'prod-05',
    slug: 'producto-5',
    name: 'Producto 5',
    price: '12,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+5',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+5',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+5+vista+2',
    ],
    href: '/products/producto-5',
    description: 'Descripcion larga de ejemplo para el Producto 5. Texto placeholder a sustituir por cliente.',
    shortDescription: 'Descripcion corta de una linea para listados.',
    categorySlug: 'categoria-2',
    categoryLabel: 'Categoria 2',
    sku: 'SKU-P05',
    stock: 15,
  },
  {
    id: 'prod-06',
    slug: 'producto-6',
    name: 'Producto 6',
    price: '22,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+6',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+6',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+6+vista+2',
    ],
    href: '/products/producto-6',
    description:
      'Descripcion larga de ejemplo para el Producto 6, agotado temporalmente. Texto placeholder a sustituir por cliente.',
    shortDescription: 'Actualmente sin stock.',
    categorySlug: 'categoria-2',
    categoryLabel: 'Categoria 2',
    sku: 'SKU-P06',
    stock: 0,
  },
  {
    id: 'prod-07',
    slug: 'producto-7',
    name: 'Producto 7',
    price: '21,90 EUR',
    compareAtPrice: '29,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+7',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+7',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+7+vista+2',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+7+vista+3',
    ],
    href: '/products/producto-7',
    badge: 'Oferta',
    description: 'Descripcion larga de ejemplo para el Producto 7, en oferta. Texto placeholder a sustituir por cliente.',
    shortDescription: 'En oferta por tiempo limitado.',
    categorySlug: 'categoria-3',
    categoryLabel: 'Categoria 3',
    sku: 'SKU-P07',
    stock: 10,
    variants: [
      {
        id: 'talla',
        label: 'Talla',
        options: [
          { id: 's', label: 'S', available: true },
          { id: 'm', label: 'M', available: true },
          { id: 'l', label: 'L', available: true },
        ],
      },
    ],
  },
  {
    id: 'prod-08',
    slug: 'producto-8',
    name: 'Producto 8',
    price: '18,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+8',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+8',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+8+vista+2',
    ],
    href: '/products/producto-8',
    description: 'Descripcion larga de ejemplo para el Producto 8. Texto placeholder a sustituir por cliente.',
    shortDescription: 'Descripcion corta de una linea para listados.',
    categorySlug: 'categoria-3',
    categoryLabel: 'Categoria 3',
    sku: 'SKU-P08',
    stock: 18,
  },
  {
    id: 'prod-09',
    slug: 'producto-9',
    name: 'Producto 9',
    price: '27,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+9',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+9',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+9+vista+2',
    ],
    href: '/products/producto-9',
    badge: 'Pocas unidades',
    description: 'Descripcion larga de ejemplo para el Producto 9. Texto placeholder a sustituir por cliente.',
    shortDescription: 'Quedan pocas unidades disponibles.',
    categorySlug: 'categoria-4',
    categoryLabel: 'Categoria 4',
    sku: 'SKU-P09',
    stock: 3,
    variants: [
      {
        id: 'color',
        label: 'Color',
        options: [
          { id: 'rojo', label: 'Rojo', available: true },
          { id: 'verde', label: 'Verde', available: true },
        ],
      },
    ],
  },
  {
    id: 'prod-10',
    slug: 'producto-10',
    name: 'Producto 10',
    price: '16,90 EUR',
    image: 'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+10',
    images: [
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+10',
      'https://placehold.co/600x600/e4e4e7/a1a1aa?text=Producto+10+vista+2',
    ],
    href: '/products/producto-10',
    description: 'Descripcion larga de ejemplo para el Producto 10. Texto placeholder a sustituir por cliente.',
    shortDescription: 'Descripcion corta de una linea para listados.',
    categorySlug: 'categoria-4',
    categoryLabel: 'Categoria 4',
    sku: 'SKU-P10',
    stock: 25,
  },
];

/** Devuelve todos los productos. Punto de entrada unico para listados generales. */
export function getAllProducts(): ProductDetail[] {
  return products;
}

/** Busca un producto por slug. Es lo que usara `products/[slug]/page.tsx`. */
export function getProductBySlug(slug: string): ProductDetail | undefined {
  return products.find((product) => product.slug === slug);
}

/** Filtra productos por categoria. Es lo que usara `category/[slug]/page.tsx`. */
export function getProductsByCategory(categorySlug: string): ProductDetail[] {
  return products.filter((product) => product.categorySlug === categorySlug);
}

/** Devuelve los primeros N productos, util para bloques tipo "Destacados". */
export function getFeaturedProducts(limit = 4): ProductDetail[] {
  return products.slice(0, limit);
}

/**
 * Productos relacionados para el PDP: usa `relatedIds` si el producto
 * los define explicitamente; si no, cae a "misma categoria, excepto
 * el propio producto".
 */
export function getRelatedProducts(product: ProductDetail, limit = 4): ProductDetail[] {
  if (product.relatedIds && product.relatedIds.length > 0) {
    return product.relatedIds
      .map((id) => products.find((candidate) => candidate.id === id))
      .filter((candidate): candidate is ProductDetail => Boolean(candidate))
      .slice(0, limit);
  }

  return products
    .filter((candidate) => candidate.categorySlug === product.categorySlug && candidate.id !== product.id)
    .slice(0, limit);
}

/** true si hay unidades disponibles. Centraliza la logica por si "stock" cambia de forma en el futuro. */
export function isInStock(product: ProductDetail): boolean {
  return product.stock > 0;
}

/**
 * Busqueda simple client-side por nombre o categoria. Pensada para
 * `search/page.tsx` mientras no haya un indice de busqueda real
 * (Algolia, Meilisearch...) conectado por API.
 */
export function searchProducts(query: string): ProductDetail[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalized) ||
      product.categoryLabel.toLowerCase().includes(normalized)
  );
}