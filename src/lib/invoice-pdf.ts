import PDFDocument from 'pdfkit';
import { formatPrice } from '@/lib/currency';
import type { Invoice, InvoiceItem } from '@prisma/client';

type InvoiceWithItems = Invoice & { items: InvoiceItem[] };

const TITLE_BY_TYPE: Record<string, string> = {
  SIMPLIFIED: 'FACTURA SIMPLIFICADA',
  FULL: 'FACTURA',
  RECTIFICATIVE: 'FACTURA RECTIFICATIVA',
};

/**
 * Genera el PDF de una factura al vuelo, a partir de los datos ya
 * inmutables guardados en Invoice/InvoiceItem (nunca se recalcula desde
 * el pedido, para que el PDF sea siempre idéntico a lo que se emitió).
 * No se persiste en ningún storage: se sirve bajo demanda desde
 * /api/invoices/[invoiceNumber] y se adjunta directamente en los emails.
 */
export function renderInvoicePdf(invoice: InvoiceWithItems): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(TITLE_BY_TYPE[invoice.type] ?? 'FACTURA', { align: 'right' });
    doc.fontSize(10).text(invoice.invoiceNumber, { align: 'right' });
    doc.text(`Fecha de emisión: ${invoice.issuedAt.toLocaleDateString('es-ES')}`, { align: 'right' });
    doc.moveDown(1.5);

    doc.fontSize(11).text(invoice.issuerName);
    doc.fontSize(9).text(`NIF: ${invoice.issuerNif}`);
    doc.text(invoice.issuerAddress);
    doc.moveDown();

    if (invoice.buyerName) {
      doc.fontSize(10).text('Datos del comprador:', { underline: true });
      doc.fontSize(9).text(invoice.buyerName);
      if (invoice.buyerNif) doc.text(`NIF: ${invoice.buyerNif}`);
      if (invoice.buyerAddress) doc.text(invoice.buyerAddress);
      doc.moveDown();
    }

    if (invoice.rectifiesInvoiceId) {
      doc.fontSize(9).fillColor('#555').text('Esta factura rectifica a una factura emitida anteriormente.');
      doc.fillColor('#000');
      doc.moveDown();
    }

    doc.fontSize(10);
    const tableTop = doc.y;
    doc.text('Concepto', 50, tableTop, { width: 220 });
    doc.text('Cant.', 270, tableTop, { width: 40, align: 'right' });
    doc.text('Base', 320, tableTop, { width: 70, align: 'right' });
    doc.text('IVA', 390, tableTop, { width: 50, align: 'right' });
    doc.text('Total', 450, tableTop, { width: 90, align: 'right' });
    doc.moveTo(50, tableTop + 14).lineTo(540, tableTop + 14).stroke();

    let y = tableTop + 20;
    for (const item of invoice.items) {
      doc.text(item.name, 50, y, { width: 220 });
      doc.text(String(item.quantity), 270, y, { width: 40, align: 'right' });
      doc.text(formatPrice(item.lineNet), 320, y, { width: 70, align: 'right' });
      doc.text(`${item.taxRate}%`, 390, y, { width: 50, align: 'right' });
      doc.text(formatPrice(item.lineTotal), 450, y, { width: 90, align: 'right' });
      y += 18;
    }

    doc.moveTo(50, y + 4).lineTo(540, y + 4).stroke();
    y += 16;

    const breakdown = invoice.taxBreakdown as { rate: number; base: number; quota: number }[];
    doc.fontSize(9).text('Desglose de IVA', 50, y);
    y += 14;
    for (const entry of breakdown) {
      doc.text(`Base ${entry.rate}%: ${formatPrice(entry.base)}    Cuota: ${formatPrice(entry.quota)}`, 50, y);
      y += 14;
    }

    y += 8;
    doc.fontSize(10).text(`Base imponible: ${formatPrice(invoice.subtotal)}`, 320, y, { width: 220, align: 'right' });
    y += 16;
    doc.text(`Total IVA: ${formatPrice(invoice.totalTax)}`, 320, y, { width: 220, align: 'right' });
    y += 16;
    doc.fontSize(12).text(`TOTAL: ${formatPrice(invoice.total)}`, 320, y, { width: 220, align: 'right' });

    if (invoice.type === 'SIMPLIFIED') {
      doc.moveDown(3);
      doc.fontSize(8).fillColor('#666').text(
        'Factura simplificada emitida conforme al artículo 4 del Reglamento por el que se regulan las obligaciones de facturación (RD 1619/2012).',
        50
      );
    }

    doc.end();
  });
}