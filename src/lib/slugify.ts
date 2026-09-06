/**
 * Convierte un texto libre en un slug URL-safe: sin acentos, minusculas,
 * espacios y simbolos colapsados en guiones. Se usa en /admin para
 * autogenerar el slug de categorias, marcas y productos nuevos a partir
 * del nombre que escribe el admin.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos (á -> a, ñ se queda pero sin tilde en la n no aplica)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Si el slug ya existe, le añade un sufijo numérico incremental
 * ("camiseta" -> "camiseta-2" -> "camiseta-3"...). `existingSlugs` es la
 * lista completa de slugs ya usados en ese recurso (categorías, marcas o
 * productos), consultada antes de llamar a esta función.
 */
export function ensureUniqueSlug(base: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(base)) return base;
  let suffix = 2;
  while (existingSlugs.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}