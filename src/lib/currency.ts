/**
 * Utilidades de precio. Los datos mock (products.config.ts) guardan
 * el precio como texto en formato es-ES, ej. "19,90 EUR". Estas
 * funciones convierten ese texto a numero para poder sumar totales
 * en el carrito, y el numero de vuelta a texto formateado para
 * pintarlo en la UI.
 */

/** Convierte un precio en texto ("19,90 EUR", "1.234,56 EUR"...) a numero. */
export function parsePriceToNumber(price: string): number {
  const cleaned = price.replace(/[^0-9,.-]/g, '').trim();

  if (cleaned.includes(',')) {
    // Formato es-ES: el punto es separador de miles, la coma es decimal.
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return Number.parseFloat(normalized) || 0;
  }

  return Number.parseFloat(cleaned) || 0;
}

/** Formatea un numero como precio en euros, ej. 24.9 -> "24,90 €". */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}