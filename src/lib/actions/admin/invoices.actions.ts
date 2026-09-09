'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin, runAdminAction, type AdminActionResult } from './admin-utils';
import { generateInvoiceForOrder, sendInvoiceEmail } from '@/lib/invoicing';

export interface InvoiceSummaryDTO {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  total: number;
  issuedAt: string;
}

export async function getInvoicesForOrder(orderNumber: string): Promise<InvoiceSummaryDTO[]> {
  await requireAdmin();
  const rows = await prisma.invoice.findMany({
    where: { order: { orderNumber } },
    orderBy: { issuedAt: 'asc' },
  });
  return rows.map((row) => ({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    type: row.type,
    status: row.status,
    total: row.total,
    issuedAt: row.issuedAt.toISOString(),
  }));
}

/** Generación manual: solo hace falta si la generación automática (al pagar) falló, o para emitir una completa con NIF a posteriori. */
export async function generateInvoiceForOrderAdminAction(
  orderNumber: string,
  buyerNif?: string,
  buyerLegalName?: string
): Promise<AdminActionResult<InvoiceSummaryDTO>> {
  return runAdminAction(async () => {
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) throw new Error('El pedido no existe.');

    const invoice = await generateInvoiceForOrder({
      orderId: order.id,
      buyerNif,
      buyerLegalName,
      forceFullInvoice: Boolean(buyerNif),
    });

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      status: invoice.status,
      total: invoice.total,
      issuedAt: invoice.issuedAt.toISOString(),
    };
  });
}

export async function resendInvoiceEmailAdminAction(invoiceNumber: string): Promise<AdminActionResult<void>> {
  return runAdminAction(async () => {
    const invoice = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (!invoice) throw new Error('La factura no existe.');
    await sendInvoiceEmail(invoice.id);
  });
}