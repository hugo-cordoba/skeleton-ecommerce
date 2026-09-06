'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureUniqueSlug, slugify } from '@/lib/slugify';
import { runAdminAction, type AdminActionResult } from './admin-utils';

export interface CategoryDTO {
  id: string;
  slug: string;
  label: string;
  productCount: number;
}

const include = { _count: { select: { products: true } } } as const;

function toDTO(row: { id: string; slug: string; label: string; _count: { products: number } }): CategoryDTO {
  return { id: row.id, slug: row.slug, label: row.label, productCount: row._count.products };
}

/**
 * Lectura para la página de admin (se llama desde el Server Component).
 * El middleware ya exige rol ADMIN en /admin/:path*, pero se revalida
 * aquí también por si esta función se reutiliza desde otro sitio.
 */
export async function getCategories(): Promise<CategoryDTO[]> {
  await requireAdmin();
  const rows = await prisma.category.findMany({ orderBy: { label: 'asc' }, include });
  return rows.map(toDTO);
}

export interface CategoryInput {
  label: string;
  /** Si se omite o queda vacío, se autogenera desde el label. */
  slug?: string;
}

export async function createCategoryAction(input: CategoryInput): Promise<AdminActionResult<CategoryDTO>> {
  return runAdminAction(async () => {
    const label = input.label.trim();
    if (!label) throw new Error('El nombre es obligatorio.');

    const baseSlug = slugify(input.slug?.trim() || label);
    if (!baseSlug) throw new Error('No se ha podido generar un slug válido a partir del nombre.');

    const existingSlugs = (await prisma.category.findMany({ select: { slug: true } })).map((c) => c.slug);
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const created = await prisma.category.create({ data: { label, slug }, include });
    return toDTO(created);
  });
}

export interface UpdateCategoryInput {
  id: string;
  label: string;
  slug: string;
}

export async function updateCategoryAction(input: UpdateCategoryInput): Promise<AdminActionResult<CategoryDTO>> {
  return runAdminAction(async () => {
    const label = input.label.trim();
    const slug = slugify(input.slug.trim());
    if (!label) throw new Error('El nombre es obligatorio.');
    if (!slug) throw new Error('El slug no puede quedar vacío.');

    const existing = await prisma.category.findUnique({ where: { id: input.id } });
    if (!existing) throw new Error('La categoría no existe.');

    if (slug !== existing.slug) {
      const clash = await prisma.category.findUnique({ where: { slug } });
      if (clash) throw new Error('Ya existe otra categoría con ese slug.');
    }

    // Si el slug cambia, Postgres propaga el cambio a Product.categorySlug
    // solo (ON UPDATE CASCADE en la FK) -- no hace falta tocar Product aquí.
    const updated = await prisma.category.update({
      where: { id: input.id },
      data: { label, slug },
      include,
    });

    return toDTO(updated);
  });
}

export async function deleteCategoryAction(id: string): Promise<AdminActionResult<void>> {
  return runAdminAction(async () => {
    const category = await prisma.category.findUnique({ where: { id }, include });
    if (!category) throw new Error('La categoría no existe.');

    if (category._count.products > 0) {
      throw new Error(
        `No se puede borrar: hay ${category._count.products} producto${category._count.products === 1 ? '' : 's'} en esta categoría.`
      );
    }

    await prisma.category.delete({ where: { id } });
  });
}