import { prisma } from '@/lib/prisma';
import type { ProductDetail } from '@/types/product.types';

function toProductDetail(p: any): ProductDetail {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    image: p.image,
    images: p.images,
    href: p.href ?? `/products/${p.slug}`,
    badge: p.badge ?? undefined,
    description: p.description,
    shortDescription: p.shortDescription ?? undefined,
    categorySlug: p.categorySlug,
    categoryLabel: p.category?.label ?? '',
    brandSlug: p.brandSlug ?? undefined,
    brandLabel: p.brand?.label ?? undefined,
    sku: p.sku,
    stock: p.stock,
    relatedIds: p.relatedIds,
    variants: p.variantGroups?.map((g: any) => ({
      id: g.id,
      label: g.label,
      options: g.options.map((o: any) => ({ id: o.id, label: o.label, available: o.available })),
    })),
  };
}

const include = { category: true, brand: true, variantGroups: { include: { options: true } } };

export async function getAllProducts(): Promise<ProductDetail[]> {
  const rows = await prisma.product.findMany({ include });
  return rows.map(toProductDetail);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | undefined> {
  const row = await prisma.product.findUnique({ where: { slug }, include });
  return row ? toProductDetail(row) : undefined;
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductDetail[]> {
  const rows = await prisma.product.findMany({ where: { categorySlug }, include });
  return rows.map(toProductDetail);
}

export async function getProductsByBrand(brandSlug: string): Promise<ProductDetail[]> {
  const rows = await prisma.product.findMany({ where: { brandSlug }, include });
  return rows.map(toProductDetail);
}

export async function getFeaturedProducts(limit = 4): Promise<ProductDetail[]> {
  const rows = await prisma.product.findMany({ take: limit, include });
  return rows.map(toProductDetail);
}

export async function getRelatedProducts(product: ProductDetail, limit = 4): Promise<ProductDetail[]> {
  if (product.relatedIds && product.relatedIds.length > 0) {
    const rows = await prisma.product.findMany({ where: { id: { in: product.relatedIds } }, include });
    return rows.map(toProductDetail).slice(0, limit);
  }
  const rows = await prisma.product.findMany({
    where: { categorySlug: product.categorySlug, id: { not: product.id } },
    take: limit,
    include,
  });
  return rows.map(toProductDetail);
}

export function isInStock(product: ProductDetail): boolean {
  return product.stock > 0; // pura, no toca DB, se queda igual
}

export async function searchProducts(query: string): Promise<ProductDetail[]> {
  const normalized = query.trim();
  if (!normalized) return [];
  const rows = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: normalized, mode: 'insensitive' } },
        { category: { label: { contains: normalized, mode: 'insensitive' } } },
      ],
    },
    include,
  });
  return rows.map(toProductDetail);
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}

export const productCategories = () => prisma.category.findMany();
export const productBrands = () => prisma.brand.findMany();

export async function getAllBrandSlugs(): Promise<string[]> {
  const brands = await prisma.brand.findMany({ select: { slug: true } });
  return brands.map((b) => b.slug);
}