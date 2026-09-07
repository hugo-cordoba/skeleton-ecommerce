'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureUniqueSlug, slugify } from '@/lib/slugify';
import { runAdminAction, type AdminActionResult } from './admin-utils';

export interface BrandDTO {
  id: string;
  slug: string;
  label: string;
  productCount: number;
}

const include = { _count: { select: { products: true } } } as const;

function toDTO(row: { id: string; slug: string; label: string; _count: { products: number } }): BrandDTO {
  return { id: row.id, slug: row.slug, label: row.label, productCount: row._count.products };
}

/**
 * Lectura para la página de admin (se llama desde el Server Component).
 * El middleware ya exige rol ADMIN en /admin/:path*, pero se revalida
 * aquí también por si esta función se reutiliza desde otro sitio.
 */
export async function getBrands(): Promise<BrandDTO[]> {
  await requireAdmin();
  const rows = await prisma.brand.findMany({ orderBy: { label: 'asc' }, include });
  return rows.map(toDTO);
}

export interface BrandInput {
  label: string;
  /** Si se omite o queda vacío, se autogenera desde el label. */
  slug?: string;
}

export async function createBrandAction(input: BrandInput): Promise<AdminActionResult<BrandDTO>> {
  return runAdminAction(async () => {
    const label = input.label.trim();
    if (!label) throw new Error('El nombre es obligatorio.');

    const baseSlug = slugify(input.slug?.trim() || label);
    if (!baseSlug) throw new Error('No se ha podido generar un slug válido a partir del nombre.');

    const existingSlugs = (await prisma.brand.findMany({ select: { slug: true } })).map((b) => b.slug);
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const created = await prisma.brand.create({ data: { label, slug }, include });
    return toDTO(created);
  });
}

export interface UpdateBrandInput {
  id: string;
  label: string;
  slug: string;
}

export async function updateBrandAction(input: UpdateBrandInput): Promise<AdminActionResult<BrandDTO>> {
  return runAdminAction(async () => {
    const label = input.label.trim();
    const slug = slugify(input.slug.trim());
    if (!label) throw new Error('El nombre es obligatorio.');
    if (!slug) throw new Error('El slug no puede quedar vacío.');

    const existing = await prisma.brand.findUnique({ where: { id: input.id } });
    if (!existing) throw new Error('La marca no existe.');

    if (slug !== existing.slug) {
      const clash = await prisma.brand.findUnique({ where: { slug } });
      if (clash) throw new Error('Ya existe otra marca con ese slug.');
    }

    // El slug es la FK que usan los productos (brandSlug); el
    // ON UPDATE CASCADE del schema ya se encarga de propagar el cambio.
    const updated = await prisma.brand.update({
      where: { id: input.id },
      data: { label, slug },
      include,
    });

    return toDTO(updated);
  });
}

export async function deleteBrandAction(id: string): Promise<AdminActionResult<void>> {
  return runAdminAction(async () => {
    const brand = await prisma.brand.findUnique({ where: { id }, include });
    if (!brand) throw new Error('La marca no existe.');

    // A diferencia de Category (FK ON DELETE RESTRICT), Product.brandSlug
    // es opcional y su FK es ON DELETE SET NULL: la BBDD sí dejaría borrar
    // una marca en uso y desasignaría el campo en silencio. Se bloquea
    // aquí a propósito, igual que en categorías, para que el admin
    // reasigne o quite la marca de esos productos de forma explícita antes.
    if (brand._count.products > 0) {
      throw new Error(
        `No se puede borrar: hay ${brand._count.products} producto${brand._count.products === 1 ? '' : 's'} con esta marca.`
      );
    }

    await prisma.brand.delete({ where: { id } });
  });
}