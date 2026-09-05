'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  stock: number;
  categoryLabel: string;
  brandLabel?: string;
}

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  const rows = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    stock: p.stock,
    categoryLabel: p.category.label,
    brandLabel: p.brand?.label,
  }));
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  name: string;
  price: string;
  compareAtPrice?: string;
  image: string;
  images: string[];
  badge?: string;
  description: string;
  shortDescription?: string;
  sku: string;
  stock: number;
  categorySlug: string;
  brandSlug?: string;
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    image: p.image,
    images: p.images,
    badge: p.badge ?? undefined,
    description: p.description,
    shortDescription: p.shortDescription ?? undefined,
    sku: p.sku,
    stock: p.stock,
    categorySlug: p.categorySlug,
    brandSlug: p.brandSlug ?? undefined,
  };
}

export interface ProductFormInput {
  name: string;
  slug: string;
  sku: string;
  price: string;
  compareAtPrice?: string;
  image: string;
  images: string[];
  badge?: string;
  description: string;
  shortDescription?: string;
  stock: number;
  categorySlug: string;
  brandSlug?: string;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createProductAction(input: ProductFormInput): Promise<ActionResult> {
  const slug = input.slug.trim() ? slugify(input.slug) : slugify(input.name);

  const existing = await prisma.product.findFirst({ where: { OR: [{ slug }, { sku: input.sku }] } });
  if (existing) {
    return {
      ok: false,
      error: existing.slug === slug ? 'Ya existe un producto con ese slug.' : 'Ya existe un producto con ese SKU.',
    };
  }

  await prisma.product.create({
    data: {
      slug,
      name: input.name,
      price: input.price,
      compareAtPrice: input.compareAtPrice || undefined,
      image: input.image,
      images: input.images.length > 0 ? input.images : [input.image],
      href: `/products/${slug}`,
      badge: input.badge || undefined,
      description: input.description,
      shortDescription: input.shortDescription || undefined,
      sku: input.sku,
      stock: input.stock,
      categorySlug: input.categorySlug,
      brandSlug: input.brandSlug || undefined,
    },
  });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  redirect('/admin/products');
}

export async function updateProductAction(id: string, input: ProductFormInput): Promise<ActionResult> {
  const slug = input.slug.trim() ? slugify(input.slug) : slugify(input.name);

  const conflict = await prisma.product.findFirst({
    where: { OR: [{ slug }, { sku: input.sku }], NOT: { id } },
  });
  if (conflict) {
    return {
      ok: false,
      error: conflict.slug === slug ? 'Ya existe otro producto con ese slug.' : 'Ya existe otro producto con ese SKU.',
    };
  }

  await prisma.product.update({
    where: { id },
    data: {
      slug,
      name: input.name,
      price: input.price,
      compareAtPrice: input.compareAtPrice || null,
      image: input.image,
      images: input.images.length > 0 ? input.images : [input.image],
      href: `/products/${slug}`,
      badge: input.badge || null,
      description: input.description,
      shortDescription: input.shortDescription || null,
      sku: input.sku,
      stock: input.stock,
      categorySlug: input.categorySlug,
      brandSlug: input.brandSlug || null,
    },
  });

  revalidatePath('/admin/products');
  revalidatePath(`/products/${slug}`);
  redirect('/admin/products');
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error('No se pudo eliminar el producto:', error);
    return { ok: false, error: 'No se ha podido eliminar. Puede que tenga pedidos asociados.' };
  }

  revalidatePath('/admin/products');
  return { ok: true };
}