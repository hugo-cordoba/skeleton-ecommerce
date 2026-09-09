import { prisma } from '@/lib/prisma';
import { Prisma, type InvoiceType } from '@prisma/client';
import { computeInvoiceTotals, round2, SHIPPING_TAX_RATE, SIMPLIFIED_INVOICE_MAX_AMOUNT } from '@/lib/tax';
import { renderInvoicePdf } from '@/lib/invoice-pdf';
import { sendEmail } from '@/lib/email';

export interface GenerateInvoiceInput {
  orderId: string;
  buyerNif?: string;
  buyerLegalName?: string;
  buyerAddress?: string;
  forceFullInvoice?: boolean;
}

function seriesForType(type: InvoiceType): string {
  switch (type) {
    case 'FULL':
      return 'FC';
    case 'RECTIFICATIVE':
      return 'FR';
    default:
      return 'FS';
  }
}

function formatInvoiceNumber(series: string, year: number, sequenceNumber: number): string {
  return `${series}-${year}-${String(sequenceNumber).padStart(6, '0')}`;
}

async function nextInvoiceNumber(tx: Prisma.TransactionClient, series: string, year: number): Promise<number> {
  // Incremento atómico dentro de la transacción: dos compras simultáneas
  // se serializan sobre esta fila y nunca pueden recibir el mismo número.
  const sequence = await tx.invoiceSequence.upsert({
    where: { series_year: { series, year } },
    create: { series, year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return sequence.lastNumber;
}

async function getFiscalConfigOrThrow() {
  const config = await prisma.fiscalConfig.findFirst();
  if (!config) {
    throw new Error(
      'No se han configurado los datos fiscales del vendedor. Configúralos en /admin/settings/fiscal antes de emitir facturas.'
    );
  }
  return config;
}

/**
 * Genera y persiste la factura (simplificada o completa) de un pedido ya
 * pagado. Si el pedido ya tiene una factura ISSUED no crea una segunda --
 * una factura nunca se duplica ni se regenera, solo se rectifica.
 */
export async function generateInvoiceForOrder(input: GenerateInvoiceInput) {
  const order = await prisma.order.findUnique({ where: { id: input.orderId }, include: { items: true } });
  if (!order) throw new Error('El pedido no existe.');

  const existing = await prisma.invoice.findFirst({ where: { orderId: order.id, status: 'ISSUED' } });
  if (existing) return existing;

  const buyerNif = input.buyerNif ?? order.buyerNif ?? undefined;
  const wantsFull = Boolean(buyerNif) || Boolean(input.forceFullInvoice);

  if (!wantsFull && order.total > SIMPLIFIED_INVOICE_MAX_AMOUNT) {
    throw new Error(
      `El importe (${order.total.toFixed(2)} €) supera los ${SIMPLIFIED_INVOICE_MAX_AMOUNT} € y no admite factura simplificada. Hacen falta los datos fiscales del comprador para emitir una factura completa.`
    );
  }

  const type: InvoiceType = wantsFull ? 'FULL' : 'SIMPLIFIED';
  const fiscalConfig = await getFiscalConfigOrThrow();

  const lines = order.items.map((item) => ({
    quantity: item.quantity,
    unitPriceGross: item.unitPrice,
    taxRate: item.taxRate,
  }));
  if (order.shippingCost > 0) {
    lines.push({ quantity: 1, unitPriceGross: order.shippingCost, taxRate: SHIPPING_TAX_RATE });
  }
  const totals = computeInvoiceTotals(lines);

  const year = order.createdAt.getFullYear();
  const series = seriesForType(type);
  const issuerAddress = `${fiscalConfig.addressLine1}${fiscalConfig.addressLine2 ? ', ' + fiscalConfig.addressLine2 : ''}, ${fiscalConfig.postalCode} ${fiscalConfig.city}, ${fiscalConfig.province}, ${fiscalConfig.country}`;

  const invoice = await prisma.$transaction(async (tx) => {
    const sequenceNumber = await nextInvoiceNumber(tx, series, year);
    const invoiceNumber = formatInvoiceNumber(series, year, sequenceNumber);

    const shippingLine = order.shippingCost > 0 ? totals.lines[totals.lines.length - 1] : null;

    return tx.invoice.create({
      data: {
        invoiceNumber,
        series,
        year,
        sequenceNumber,
        type,
        orderId: order.id,
        issuerName: fiscalConfig.legalName,
        issuerNif: fiscalConfig.nif,
        issuerAddress,
        buyerName: wantsFull ? input.buyerLegalName ?? order.buyerLegalName ?? order.shippingFullName : null,
        buyerNif: wantsFull ? buyerNif : null,
        buyerAddress: wantsFull
          ? input.buyerAddress ?? `${order.shippingLine1}, ${order.shippingPostal} ${order.shippingCity}`
          : null,
        subtotal: totals.subtotal,
        taxBreakdown: totals.breakdown,
        totalTax: totals.totalTax,
        total: totals.total,
        items: {
          create: [
            ...order.items.map((item, index) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              unitPriceNet: round2(totals.lines[index].lineNet / item.quantity),
              taxRate: item.taxRate,
              lineNet: totals.lines[index].lineNet,
              lineTax: totals.lines[index].lineTax,
              lineTotal: totals.lines[index].lineTotal,
            })),
            ...(shippingLine
              ? [
                  {
                    productId: null,
                    name: `Envío (${order.shippingMethodLabel})`,
                    quantity: 1,
                    unitPriceNet: shippingLine.lineNet,
                    taxRate: SHIPPING_TAX_RATE,
                    lineNet: shippingLine.lineNet,
                    lineTax: shippingLine.lineTax,
                    lineTotal: shippingLine.lineTotal,
                  },
                ]
              : []),
          ],
        },
      },
      include: { items: true },
    });
  });

  return invoice;
}

/** Renderiza y envía por email una factura ya emitida. Se usa para reenvíos manuales y para rectificativas. */
export async function sendInvoiceEmail(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { items: true, order: true } });
  if (!invoice) throw new Error('La factura no existe.');

  const pdfBuffer = await renderInvoicePdf(invoice);
  const result = await sendEmail({
    to: invoice.order.email,
    subject: `Factura ${invoice.invoiceNumber}`,
    html: `<p>Adjuntamos la factura correspondiente a tu pedido ${invoice.order.orderNumber}.</p>`,
    attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer.toString('base64') }],
  });
  if (!result.ok) throw new Error(result.error ?? 'No se ha podido enviar el email de la factura.');
}

/**
 * Emite una factura rectificativa que anula (total o parcialmente) una
 * factura ya emitida. Nunca se edita ni se borra la original. Se llama
 * desde refundOrderAction al reembolsar un pedido.
 */
export async function generateRectificativeInvoice(originalInvoiceId: string, refundedAmountGross: number) {
  const original = await prisma.invoice.findUnique({ where: { id: originalInvoiceId } });
  if (!original) throw new Error('La factura original no existe.');
  if (original.status === 'RECTIFIED') throw new Error('Esta factura ya tiene una rectificativa asociada.');

  const isFullRefund = round2(refundedAmountGross) >= round2(original.total);
  const ratio = isFullRefund ? 1 : refundedAmountGross / original.total;

  const originalBreakdown = original.taxBreakdown as { rate: number; base: number; quota: number }[];
  const breakdown = originalBreakdown.map((entry) => ({
    rate: entry.rate,
    base: round2(-entry.base * ratio),
    quota: round2(-entry.quota * ratio),
  }));
  const subtotal = round2(breakdown.reduce((sum, e) => sum + e.base, 0));
  const totalTax = round2(breakdown.reduce((sum, e) => sum + e.quota, 0));
  const total = round2(subtotal + totalTax);

  const year = new Date().getFullYear();
  const series = 'FR';

  const rectificative = await prisma.$transaction(async (tx) => {
    const sequenceNumber = await nextInvoiceNumber(tx, series, year);
    const invoiceNumber = formatInvoiceNumber(series, year, sequenceNumber);

    const created = await tx.invoice.create({
      data: {
        invoiceNumber,
        series,
        year,
        sequenceNumber,
        type: 'RECTIFICATIVE',
        orderId: original.orderId,
        issuerName: original.issuerName,
        issuerNif: original.issuerNif,
        issuerAddress: original.issuerAddress,
        buyerName: original.buyerName,
        buyerNif: original.buyerNif,
        buyerAddress: original.buyerAddress,
        subtotal,
        taxBreakdown: breakdown,
        totalTax,
        total,
        rectifiesInvoiceId: original.id,
        items: {
          create: breakdown.map((entry) => ({
            productId: null,
            name: `Rectificación factura ${original.invoiceNumber}${isFullRefund ? ' (anulación total)' : ' (devolución parcial)'} — IVA ${entry.rate}%`,
            quantity: 1,
            unitPriceNet: entry.base,
            taxRate: entry.rate,
            lineNet: entry.base,
            lineTax: entry.quota,
            lineTotal: round2(entry.base + entry.quota),
          })),
        },
      },
      include: { items: true },
    });

    if (isFullRefund) {
      await tx.invoice.update({ where: { id: original.id }, data: { status: 'RECTIFIED' } });
    }

    return created;
  });

  return rectificative;
}