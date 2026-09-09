import { prisma } from '@/lib/prisma';
import { round2 } from '@/lib/tax';
import { statusToClient, toOrderDTO } from '@/lib/order-mapper';
import { sendEmail, orderRefundEmailHtml } from '@/lib/email';
import { generateRectificativeInvoice, sendInvoiceEmail } from '@/lib/invoicing';
import type { OrderStatus } from '@/types/order.types';

export interface ApplyRefundInput {
  orderId: string;
  /** Importe TOTAL acumulado reembolsado de este pedido tras esta operación, en EUR. */
  targetRefundedAmount: number;
}

export interface ApplyRefundResult {
  status: OrderStatus;
  refundedAmount: number;
  deltaAmount: number;
  /** true si no había nada nuevo que aplicar (evento repetido o importe ya sincronizado). */
  alreadyProcessed: boolean;
}

/**
 * Aplica un reembolso ya EJECUTADO en Stripe al pedido: actualiza estado y
 * refundedAmount, repone stock si es cancelación total, genera la factura
 * rectificativa y envía el email al cliente. NO llama a
 * stripe.refunds.create -- eso lo hace quien origina el reembolso
 * (refundOrderAction) o ya ha pasado fuera de la app (dashboard de Stripe,
 * sincronizado por el webhook charge.refunded).
 *
 * Idempotente: si targetRefundedAmount no supera lo ya registrado, no hace
 * nada. Esto protege tanto contra reintentos del webhook como contra una
 * carrera poco probable entre refundOrderAction y el webhook procesando el
 * mismo reembolso casi a la vez -- quien llegue segundo ve que ya está
 * aplicado y no duplica nada (la factura rectificativa además está
 * protegida por la unicidad de Invoice.rectifiesInvoiceId).
 */
export async function applyRefundToOrder(input: ApplyRefundInput): Promise<ApplyRefundResult> {
  const order = await prisma.order.findUnique({ where: { id: input.orderId }, include: { items: true } });
  if (!order) throw new Error('El pedido no existe.');

  const alreadyRefunded = order.refundedAmount ?? 0;
  const target = round2(input.targetRefundedAmount);

  if (target <= alreadyRefunded + 0.01) {
    return {
      status: statusToClient(order.status),
      refundedAmount: alreadyRefunded,
      deltaAmount: 0,
      alreadyProcessed: true,
    };
  }

  const deltaAmount = round2(target - alreadyRefunded);
  const isFullRefund = target >= order.total - 0.01;
  const wasAlreadyCancelled = order.status === 'CANCELLED';
  const nextStatus = isFullRefund ? 'CANCELLED' : order.status;

  await prisma.$transaction(async (tx) => {
    if (isFullRefund && !wasAlreadyCancelled) {
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }
    await tx.order.update({
      where: { id: order.id },
      data: {
        refundedAmount: target,
        refundedAt: new Date(),
        status: nextStatus,
        cancelledAt: isFullRefund ? order.cancelledAt ?? new Date() : order.cancelledAt,
      },
    });
  });

  // Factura rectificativa + email al cliente: best-effort, igual que el
  // resto de notificaciones de pedido -- un fallo aquí no debe revertir el
  // reembolso, que ya es un hecho consumado.
  //
  // LIMITACIÓN CONOCIDA: Invoice.rectifiesInvoiceId es único (una sola
  // rectificativa por factura original), así que un SEGUNDO reembolso
  // parcial sobre el mismo pedido fallará aquí (se loguea, no se lanza).
  // Si se necesitan reembolsos parciales repetidos, esto habría que
  // rediseñarlo para permitir varias rectificativas por factura.
  const originalInvoice = await prisma.invoice.findFirst({ where: { orderId: order.id, status: 'ISSUED' } });
  if (originalInvoice) {
    try {
      const rectificative = await generateRectificativeInvoice(originalInvoice.id, deltaAmount);
      await sendInvoiceEmail(rectificative.id);
    } catch (error) {
      console.error('No se ha podido generar/enviar la factura rectificativa:', order.orderNumber, error);
    }
  }

  try {
    const orderDto = toOrderDTO(order);
    const subject = isFullRefund
      ? `Tu pedido ${orderDto.orderNumber} ha sido cancelado y reembolsado`
      : `Reembolso parcial de tu pedido ${orderDto.orderNumber}`;
    const result = await sendEmail({
      to: orderDto.email,
      subject,
      html: orderRefundEmailHtml(orderDto, deltaAmount, isFullRefund),
    });
    if (!result.ok) {
      console.error('No se ha podido enviar el email de reembolso:', order.orderNumber, result.error);
    }
  } catch (error) {
    console.error('Error inesperado enviando el email de reembolso:', error);
  }

  return {
    status: statusToClient(nextStatus),
    refundedAmount: target,
    deltaAmount,
    alreadyProcessed: false,
  };
}