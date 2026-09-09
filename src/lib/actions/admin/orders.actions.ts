'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { requireAdmin } from '@/lib/admin-auth';
import { sendEmail, orderConfirmationEmailHtml, orderStatusUpdateEmailHtml, orderRefundEmailHtml } from '@/lib/email';
import { runAdminAction, type AdminActionResult } from './admin-utils';
import { statusToClient, statusToPrisma, toOrderDTO } from '@/lib/order-mapper';
import type { Order, OrderStatus, ShippingAddress } from '@/types/order.types';
import { generateRectificativeInvoice, sendInvoiceEmail } from '@/lib/invoicing';
import { renderInvoicePdf } from '@/lib/invoice-pdf';

export interface AdminOrderSummary {
  orderNumber: string;
  email: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  isGuest: boolean;
}

export interface AdminOrdersResult {
  orders: AdminOrderSummary[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface AdminOrdersQuery {
  status?: OrderStatus;
  query?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

/** Best-effort, igual que sendOrderConfirmationEmail del webhook: un fallo de envío no debe tumbar la action. */
async function sendOrderStatusEmail(row: Parameters<typeof toOrderDTO>[0], status: 'shipped' | 'delivered'): Promise<void> {
  try {
    const order = toOrderDTO(row);
    const statusLabel = status === 'shipped' ? 'enviado' : 'entregado';
    const result = await sendEmail({
      to: order.email,
      subject: `Tu pedido ${order.orderNumber} ha sido ${statusLabel}`,
      html: orderStatusUpdateEmailHtml(order, status),
    });
    if (!result.ok) {
      console.error('No se ha podido enviar el email de estado del pedido:', order.orderNumber, result.error);
    }
  } catch (error) {
    console.error('Error inesperado enviando el email de estado del pedido:', error);
  }
}

async function sendOrderRefundEmail(
  row: Parameters<typeof toOrderDTO>[0],
  refundedAmount: number,
  isFullRefund: boolean
): Promise<void> {
  try {
    const order = toOrderDTO(row);
    const subject = isFullRefund
      ? `Tu pedido ${order.orderNumber} ha sido cancelado y reembolsado`
      : `Reembolso parcial de tu pedido ${order.orderNumber}`;
    const result = await sendEmail({ to: order.email, subject, html: orderRefundEmailHtml(order, refundedAmount, isFullRefund) });
    if (!result.ok) {
      console.error('No se ha podido enviar el email de reembolso:', order.orderNumber, result.error);
    }
  } catch (error) {
    console.error('Error inesperado enviando el email de reembolso:', error);
  }
}

export async function getAdminOrders(params: AdminOrdersQuery = {}): Promise<AdminOrdersResult> {
  await requireAdmin();

  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const where: Prisma.OrderWhereInput = {
    ...(params.status ? { status: statusToPrisma(params.status) } : {}),
    ...(params.query
      ? {
          OR: [
            { orderNumber: { contains: params.query, mode: 'insensitive' } },
            { email: { contains: params.query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        orderNumber: true,
        email: true,
        createdAt: true,
        status: true,
        total: true,
        userId: true,
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: rows.map((row) => ({
      orderNumber: row.orderNumber,
      email: row.email,
      createdAt: row.createdAt.toISOString(),
      status: statusToClient(row.status),
      total: row.total,
      itemCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
      isGuest: !row.userId,
    })),
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    totalItems,
  };
}

export interface AdminOrderDetail extends Order {
  isGuest: boolean;
  internalNotes: string | null;
  refundedAmount: number | null;
  cancelledAt: string | null;
}

export async function getAdminOrderDetail(orderNumber: string): Promise<AdminOrderDetail | null> {
  await requireAdmin();

  const row = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!row) return null;

  return {
    ...toOrderDTO(row),
    isGuest: !row.userId,
    internalNotes: row.internalNotes,
    refundedAmount: row.refundedAmount,
    cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
  };
}

export async function updateOrderStatusAction(
  orderNumber: string,
  status: OrderStatus
): Promise<AdminActionResult<{ status: OrderStatus }>> {
  return runAdminAction(async () => {
    if (status === 'cancelled') {
      throw new Error('Para cancelar un pedido usa la acción de reembolso.');
    }

    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) throw new Error('El pedido no existe.');
    if (existing.status === 'CANCELLED') throw new Error('Este pedido está cancelado y no se puede modificar.');

    const updated = await prisma.order.update({
      where: { orderNumber },
      data: { status: statusToPrisma(status) },
      include: { items: true },
    });

    // "processing" ya lo cubre el email de confirmación; solo avisamos en los cambios que le importan al cliente.
    if (status === 'shipped' || status === 'delivered') {
      await sendOrderStatusEmail(updated, status);
    }

    return { status };
  });
}

/* ---------- Reembolso / cancelación ---------- */

export interface RefundOrderInput {
  /** Importe a reembolsar en EUR. Si se omite, se reembolsa todo el pendiente y el pedido pasa a cancelado. */
  amount?: number;
}

export interface RefundOrderResult {
  status: OrderStatus;
  refundedAmount: number;
}

export async function refundOrderAction(
  orderNumber: string,
  input: RefundOrderInput = {}
): Promise<AdminActionResult<RefundOrderResult>> {
  return runAdminAction(async () => {
    const order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
    if (!order) throw new Error('El pedido no existe.');
    if (order.status === 'CANCELLED') throw new Error('Este pedido ya está cancelado.');

    const alreadyRefunded = order.refundedAmount ?? 0;
    const remaining = order.total - alreadyRefunded;
    if (remaining <= 0) throw new Error('Este pedido ya se ha reembolsado por completo.');

    const isFullRefund = input.amount == null;
    const amountToRefund = isFullRefund ? remaining : input.amount!;

    if (!Number.isFinite(amountToRefund) || amountToRefund <= 0 || amountToRefund > remaining + 0.01) {
      throw new Error(`El importe debe estar entre 0 y ${remaining.toFixed(2)} EUR.`);
    }

    if (order.stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
      if (!paymentIntentId) throw new Error('No se ha encontrado el cobro original en Stripe.');

      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amountToRefund * 100),
      });
    }
    // Pedidos legacy sin stripeSessionId: el reembolso se registra solo internamente.

    const newRefundedAmount = alreadyRefunded + amountToRefund;
    const nextStatus = isFullRefund ? 'CANCELLED' : order.status;

    await prisma.$transaction(async (tx) => {
      if (isFullRefund) {
        for (const item of order.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
      }
      await tx.order.update({
        where: { orderNumber },
        data: {
          refundedAmount: newRefundedAmount,
          refundedAt: new Date(),
          status: nextStatus,
          cancelledAt: isFullRefund ? new Date() : order.cancelledAt,
        },
      });
    });

    const originalInvoice = await prisma.invoice.findFirst({ where: { orderId: order.id, status: 'ISSUED' } });
    if (originalInvoice) {
      try {
        const rectificative = await generateRectificativeInvoice(originalInvoice.id, amountToRefund);
        await sendInvoiceEmail(rectificative.id);
      } catch (error) {
        console.error('No se ha podido generar/enviar la factura rectificativa:', orderNumber, error);
      }
    }

    await sendOrderRefundEmail(order, amountToRefund, isFullRefund);

    return { status: statusToClient(nextStatus), refundedAmount: newRefundedAmount };
  });
}

/* ---------- Dirección de envío ---------- */

export async function updateOrderShippingAddressAction(
  orderNumber: string,
  address: ShippingAddress
): Promise<AdminActionResult<ShippingAddress>> {
  return runAdminAction(async () => {
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) throw new Error('El pedido no existe.');
    if (existing.status === 'CANCELLED') throw new Error('No se puede editar la dirección de un pedido cancelado.');

    const fullName = address.fullName.trim();
    const addressLine1 = address.addressLine1.trim();
    const city = address.city.trim();
    const postalCode = address.postalCode.trim();
    const country = address.country.trim();

    if (!fullName || !addressLine1 || !city || !postalCode || !country) {
      throw new Error('Completa los campos obligatorios de la dirección.');
    }

    await prisma.order.update({
      where: { orderNumber },
      data: {
        shippingFullName: fullName,
        shippingLine1: addressLine1,
        shippingLine2: address.addressLine2?.trim() || null,
        shippingCity: city,
        shippingPostal: postalCode,
        shippingCountry: country,
        shippingPhone: address.phone?.trim() || null,
      },
    });

    return {
      fullName,
      addressLine1,
      addressLine2: address.addressLine2?.trim() || undefined,
      city,
      postalCode,
      country,
      phone: address.phone?.trim() || undefined,
    };
  });
}

/* ---------- Notas internas ---------- */

export async function updateOrderInternalNotesAction(
  orderNumber: string,
  notes: string
): Promise<AdminActionResult<{ internalNotes: string | null }>> {
  return runAdminAction(async () => {
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) throw new Error('El pedido no existe.');

    const trimmed = notes.trim();
    await prisma.order.update({ where: { orderNumber }, data: { internalNotes: trimmed || null } });
    return { internalNotes: trimmed || null };
  });
}

/* ---------- Reenviar email de confirmación ---------- */

export async function resendOrderConfirmationEmailAction(orderNumber: string): Promise<AdminActionResult<void>> {
  return runAdminAction(async () => {
    const row = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
    if (!row) throw new Error('El pedido no existe.');

    const order = toOrderDTO(row);

    // Buscar factura asociada al pedido para adjuntarla si existe
    let attachments: { filename: string; content: Buffer | string }[] | undefined;
    const invoice = await prisma.invoice.findFirst({
      where: { orderId: row.id, status: 'ISSUED' },
      include: { items: true },
    });

    if (invoice) {
      try {
        const pdfBuffer = await renderInvoicePdf(invoice);
        attachments = [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer }];
      } catch (error) {
        console.error('Error renderizando PDF de factura para reenvío:', error);
      }
    }

    const result = await sendEmail({
      to: order.email,
      subject: `Confirmación de tu pedido ${order.orderNumber}`,
      html: orderConfirmationEmailHtml(order),
      attachments,
    });

    if (!result.ok) throw new Error(result.error ?? 'No se ha podido reenviar el email.');
  });
}