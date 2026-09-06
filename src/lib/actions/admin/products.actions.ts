'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureUniqueSlug, slugify } from '@/lib/slugify';
import { parsePriceToNumber, toPriceString } from '@/lib/currency';
import { runAdminAction, type AdminActionResult } from './admin-utils';
import type { ProductStatus } from '@/types/product.types';

/* ---------- Listado ---------- */

export interface ProductSummary {
  id: string;
  name: string;
  sku: string;
  image: string;
  price: string;
  stock: number;
  status: ProductStatus;
  categoryLabel: string;
  brandLabel?: string;
}

export interface AdminProductsResult {
  products: ProductSummary[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface AdminProductsQuery {
  query?: string;
  categorySlug?: string;
  status?: ProductStatus;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

type ProductListRow = {
  id: string;
  name: string;
  sku: string;
  image: string;
  price: string;
  stock: number;
  status: ProductStatus;
  category: { label: string };
  brand: { label: string } | null;
};

function toSummary(row: ProductListRow): ProductSummary {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    image: row.image,
    price: row.price,
    stock: row.stock,
    status: row.status,
    categoryLabel: row.category.label,
    brandLabel: row.brand?.label ?? undefined,
  };
}

export async function getAdminProducts(params: AdminProductsQuery = {}): Promise<AdminProductsResult> {
  await requireAdmin();

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const where: Prisma.ProductWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.categorySlug ? { categorySlug: params.categorySlug } : {}),
    ...(params.query
      ? {
          OR: [
            { name: { contains: params.query, mode: 'insensitive' } },
            { sku: { contains: params.query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        sku: true,
        image: true,
        price: true,
        stock: true,
        status: true,
        category: { select: { label: true } },
        brand: { select: { label: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: rows.map(toSummary),
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    totalItems,
  };
}

/* ---------- Categorías / marcas para los selects del formulario ---------- */

export interface OptionDTO {
  slug: string;
  label: string;
}

export async function getCategoryOptions(): Promise<OptionDTO[]> {
  await requireAdmin();
  return prisma.category.findMany({ orderBy: { label: 'asc' }, select: { slug: true, label: true } });
}

export async function getBrandOptions(): Promise<OptionDTO[]> {
  await requireAdmin();
  return prisma.brand.findMany({ orderBy: { label: 'asc' }, select: { slug: true, label: true } });
}

/* ---------- Detalle (para el formulario de edición) ---------- */

export interface AdminVariantOptionInput {
  label: string;
  available: boolean;
}

export interface AdminVariantGroupInput {
  label: string;
  options: AdminVariantOptionInput[];
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  description: string;
  shortDescription: string;
  sku: string;
  stock: number;
  status: ProductStatus;
  categorySlug: string;
  brandSlug: string;
  badge: string;
  variantGroups: AdminVariantGroupInput[];
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  await requireAdmin();

  const row = await prisma.product.findUnique({
    where: { id },
    include: { variantGroups: { include: { options: true } } },
  });
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: parsePriceToNumber(row.price),
    compareAtPrice: row.compareAtPrice ? parsePriceToNumber(row.compareAtPrice) : null,
    images: row.images.length > 0 ? row.images : [row.image],
    description: row.description,
    shortDescription: row.shortDescription ?? '',
    sku: row.sku,
    stock: row.stock,
    status: row.status as ProductStatus,
    categorySlug: row.categorySlug,
    brandSlug: row.brandSlug ?? '',
    badge: row.badge ?? '',
    variantGroups: row.variantGroups.map((group) => ({
      label: group.label,
      options: group.options.map((option) => ({ label: option.label, available: option.available })),
    })),
  };
}

/* ---------- Crear / editar ---------- */

export interface ProductFormInput {
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  description: string;
  shortDescription?: string;
  sku: string;
  stock: number;
  status: ProductStatus;
  categorySlug: string;
  brandSlug?: string;
  badge?: string;
  variantGroups: AdminVariantGroupInput[];
}

function validateProductInput(input: ProductFormInput): void {
  if (!input.name.trim()) throw new Error('El nombre es obligatorio.');
  if (!input.sku.trim()) throw new Error('El SKU es obligatorio.');
  if (!input.categorySlug) throw new Error('Selecciona una categoría.');
  if (input.images.filter((url) => url.trim()).length === 0) {
    throw new Error('Añade al menos una imagen.');
  }
  if (input.price < 0) throw new Error('El precio no puede ser negativo.');
  if (input.compareAtPrice != null && input.compareAtPrice <= input.price) {
    throw new Error('El precio tachado debe ser mayor que el precio actual.');
  }
  if (input.stock < 0) throw new Error('El stock no puede ser negativo.');
  for (const group of input.variantGroups) {
    if (!group.label.trim()) throw new Error('Cada grupo de variante necesita una etiqueta (ej. "Talla").');
    if (group.options.length === 0) throw new Error(`El grupo "${group.label}" necesita al menos una opción.`);
    for (const option of group.options) {
      if (!option.label.trim()) throw new Error(`Una opción del grupo "${group.label}" no puede estar vacía.`);
    }
  }
}

function variantGroupsCreateData(groups: AdminVariantGroupInput[]) {
  const cleaned = groups
    .map((group) => ({
      label: group.label.trim(),
      options: group.options.filter((option) => option.label.trim()),
    }))
    .filter((group) => group.options.length > 0);

  if (cleaned.length === 0) return undefined;

  return {
    create: cleaned.map((group) => ({
      label: group.label,
      options: {
        create: group.options.map((option) => ({ label: option.label.trim(), available: option.available })),
      },
    })),
  };
}

export async function createProductAction(input: ProductFormInput): Promise<AdminActionResult<{ id: string }>> {
  return runAdminAction(async () => {
    validateProductInput(input);

    const baseSlug = slugify(input.slug?.trim() || input.name);
    if (!baseSlug) throw new Error('No se ha podido generar un slug válido a partir del nombre.');
    const existingSlugs = (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug);
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const skuClash = await prisma.product.findUnique({ where: { sku: input.sku.trim() } });
    if (skuClash) throw new Error('Ya existe un producto con ese SKU.');

    const images = input.images.map((url) => url.trim()).filter(Boolean);

    const created = await prisma.product.create({
      data: {
        slug,
        name: input.name.trim(),
        price: toPriceString(input.price),
        compareAtPrice: input.compareAtPrice != null ? toPriceString(input.compareAtPrice) : null,
        image: images[0],
        images,
        description: input.description,
        shortDescription: input.shortDescription?.trim() || null,
        sku: input.sku.trim(),
        stock: input.stock,
        status: input.status,
        categorySlug: input.categorySlug,
        brandSlug: input.brandSlug || null,
        badge: input.badge?.trim() || null,
        relatedIds: [],
        variantGroups: variantGroupsCreateData(input.variantGroups),
      },
    });

    return { id: created.id };
  });
}

export async function updateProductAction(
  id: string,
  input: ProductFormInput
): Promise<AdminActionResult<{ id: string }>> {
  return runAdminAction(async () => {
    validateProductInput(input);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new Error('El producto no existe.');

    const slug = slugify(input.slug?.trim() || input.name);
    if (!slug) throw new Error('El slug no puede quedar vacío.');
    if (slug !== existing.slug) {
      const clash = await prisma.product.findUnique({ where: { slug } });
      if (clash) throw new Error('Ya existe otro producto con ese slug.');
    }

    if (input.sku.trim() !== existing.sku) {
      const clash = await prisma.product.findUnique({ where: { sku: input.sku.trim() } });
      if (clash) throw new Error('Ya existe otro producto con ese SKU.');
    }

    const images = input.images.map((url) => url.trim()).filter(Boolean);

    await prisma.$transaction(async (tx) => {
      // Los grupos de variante se sustituyen enteros (borrar + crear) en vez
      // de diffear uno a uno: carrito y pedidos guardan la etiqueta elegida
      // como texto plano (no el id de la opción), así que esto no rompe nada.
      await tx.productVariantGroup.deleteMany({ where: { productId: id } });

      await tx.product.update({
        where: { id },
        data: {
          slug,
          name: input.name.trim(),
          price: toPriceString(input.price),
          compareAtPrice: input.compareAtPrice != null ? toPriceString(input.compareAtPrice) : null,
          image: images[0],
          images,
          description: input.description,
          shortDescription: input.shortDescription?.trim() || null,
          sku: input.sku.trim(),
          stock: input.stock,
          status: input.status,
          categorySlug: input.categorySlug,
          brandSlug: input.brandSlug || null,
          badge: input.badge?.trim() || null,
          variantGroups: variantGroupsCreateData(input.variantGroups),
        },
      });
    });

    return { id };
  });
}

/* ---------- Archivar / restaurar ---------- */

export async function archiveProductAction(id: string): Promise<AdminActionResult<void>> {
  return runAdminAction(async () => {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new Error('El producto no existe.');
    await prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
  });
}

export async function restoreProductAction(id: string): Promise<AdminActionResult<void>> {
  return runAdminAction(async () => {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new Error('El producto no existe.');
    await prisma.product.update({ where: { id }, data: { status: 'ACTIVE' } });
  });
}