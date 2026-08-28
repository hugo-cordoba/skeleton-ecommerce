/**
 * Genera un id de linea unico por producto + combinacion de variantes
 * elegidas (ej. "prod-01__Talla:M"). Antes vivia en CartContext; se saca
 * aqui porque ahora tambien la necesita el server action.
 */
export function buildCartLineId(productId: string, selectedVariants?: Record<string, string>): string {
  if (!selectedVariants || Object.keys(selectedVariants).length === 0) return productId;

  const variantKey = Object.entries(selectedVariants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, option]) => `${group}:${option}`)
    .join('|');

  return `${productId}__${variantKey}`;
}