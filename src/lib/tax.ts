/**
 * Cálculo de IVA. Los precios de producto (Product.price, "24,90 EUR")
 * se guardan CON IVA incluido, como es habitual en un escaparate B2C.
 * Estas funciones desglosan la base imponible y la cuota a partir de ese
 * precio final, agrupando por tipo cuando el pedido mezcla varios tipos
 * -- es obligatorio mostrar el desglose por cada tipo impositivo aplicado,
 * no se puede aplicar un tipo "medio".
 */

export const TAX_RATE_OPTIONS = [
  { value: 21, label: 'General (21%)' },
  { value: 10, label: 'Reducido (10%)' },
  { value: 4, label: 'Superreducido (4%)' },
  { value: 0, label: 'Exento (0%)' },
] as const;

export const DEFAULT_TAX_RATE = 21;
/** Tipo aplicado al envío cuando no se indique lo contrario (servicio accesorio, tipo general). */
export const SHIPPING_TAX_RATE = 21;

/** Umbral del art. 4 RD 1619/2012: por encima de este importe (IVA incluido) no cabe factura simplificada. */
export const SIMPLIFIED_INVOICE_MAX_AMOUNT = 3000;

/** Redondeo a 2 decimales evitando errores de coma flotante (0.1 + 0.2). */
export function round2(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/** A partir de un importe CON IVA y el tipo aplicado, devuelve la base imponible (sin IVA). */
export function grossToNet(gross: number, taxRatePercent: number): number {
  return round2(gross / (1 + taxRatePercent / 100));
}

export interface TaxableLine {
  quantity: number;
  unitPriceGross: number; // precio unitario CON IVA
  taxRate: number; // porcentaje, ej. 21
}

export interface InvoiceLineComputed extends TaxableLine {
  lineNet: number;
  lineTax: number;
  lineTotal: number;
}

export interface TaxBreakdownEntry {
  rate: number;
  base: number;
  quota: number;
}

export interface InvoiceTotals {
  lines: InvoiceLineComputed[];
  subtotal: number; // base imponible total
  totalTax: number;
  total: number;
  breakdown: TaxBreakdownEntry[]; // uno por cada tipo distinto usado
}

export function computeInvoiceTotals(lines: TaxableLine[]): InvoiceTotals {
  const computedLines: InvoiceLineComputed[] = lines.map((line) => {
    const lineGross = round2(line.unitPriceGross * line.quantity);
    const lineNet = grossToNet(lineGross, line.taxRate);
    const lineTax = round2(lineGross - lineNet);
    return { ...line, lineNet, lineTax, lineTotal: lineGross };
  });

  const byRate = new Map<number, { base: number; quota: number }>();
  for (const line of computedLines) {
    const entry = byRate.get(line.taxRate) ?? { base: 0, quota: 0 };
    entry.base = round2(entry.base + line.lineNet);
    entry.quota = round2(entry.quota + line.lineTax);
    byRate.set(line.taxRate, entry);
  }

  const breakdown: TaxBreakdownEntry[] = Array.from(byRate.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([rate, { base, quota }]) => ({ rate, base, quota }));

  const subtotal = round2(breakdown.reduce((sum, entry) => sum + entry.base, 0));
  const totalTax = round2(breakdown.reduce((sum, entry) => sum + entry.quota, 0));
  const total = round2(subtotal + totalTax);

  return { lines: computedLines, subtotal, totalTax, total, breakdown };
}