/**
 * Producto "base": es el tipo minimo que consumen los componentes
 * genericos que ya existen (ProductCard, FeatureBanner). Cualquier
 * producto real (mock hoy, backend/CMS mañana) tiene que cumplir
 * como minimo esta forma para poder pintarse en esos componentes.
 *
 * `slug` es obligatorio porque lo usa la ruta dinamica del PDP
 * (`/products/[slug]`) y por eso `href` en los datos mock siempre
 * apunta a `/products/${slug}`.
 */
export interface Product {
  id: string;
  slug: string;
  name: string;
  price: string;
  image: string;
  href?: string;
  badge?: string;
}

/**
 * Una opcion dentro de un grupo de variante, ej. "M" dentro de
 * "Talla" o "Azul" dentro de "Color". `available: false` es lo que
 * usara el selector del PDP para pintar la opcion como agotada /
 * deshabilitada sin quitarla de la lista.
 */
export interface ProductVariantOption {
  id: string;
  label: string;
  available: boolean;
}

/**
 * Un grupo de variante completo (Talla, Color...). Un producto puede
 * tener 0, 1 o varios grupos (ej. Talla + Color a la vez).
 */
export interface ProductVariantGroup {
  id: string;
  label: string;
  options: ProductVariantOption[];
}

/**
 * Producto completo, con todo lo que necesita la pagina de producto
 * (PDP), la pagina de categoria y el carrito. Extiende `Product`, asi
 * que un `ProductDetail` tambien sirve en cualquier sitio donde se
 * espere un `Product` (ProductCard, ProductCarousel, FeatureBanner).
 */

export interface ProductDetail extends Product {
  images: string[];
  description: string;
  shortDescription?: string;
  categorySlug: string;
  categoryLabel: string;
  brandSlug?: string;
  brandLabel?: string;
  compareAtPrice?: string;
  sku: string;
  stock: number;
  variants?: ProductVariantGroup[];
  relatedIds?: string[];
}