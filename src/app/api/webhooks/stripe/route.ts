// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { parsePriceToNumber } from '@/lib/currency';
import { shippingMethods } from '@/data/shipping.config';
import { generateOrderNumber } from '@/lib/order-number';
import { sendEmail, orderConfirmationEmailHtml } from '@/lib/email';
import { toOrderDTO, type OrderRow } from '@/lib/order-mapper';
import { generateInvoiceForOrder } from '@/lib/invoicing';
import { renderInvoicePdf } from '@/lib/invoice-pdf';
import { applyRefundToOrder } from '@/lib/refund-processing';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma del webhook' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error('Firma de webhook de Stripe inválida:', error);
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const existingOrder = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (existingOrder) return; // evento duplicado (Stripe reintenta)

  const meta = session.metadata;
  if (!meta?.email) {
    console.error('Sesión de Stripe sin metadata esperada:', session.id);
    return;
  }

  const where = meta.userId ? { userId: meta.userId } : { guestId: meta.guestId };
  const shippingMethod = shippingMethods.find((method) => method.id === meta.shippingMethodId);
  if (!shippingMethod) {
    console.error('shippingMethodId desconocido en metadata:', meta.shippingMethodId);
    return;
  }

  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({ where, include: { product: true } });
      if (cartItems.length === 0) throw new Error('El carrito ya estaba vacío al procesar el pago.');

      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Sin stock suficiente de "${item.product.name}".`);
        }
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + parsePriceToNumber(item.product.price) * item.quantity,
        0
      );

      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          ...(meta.userId ? { userId: meta.userId } : { guestId: meta.guestId }),
          email: meta.email,
          shippingFullName: meta.fullName,
          shippingLine1: meta.addressLine1,
          shippingLine2: meta.addressLine2 || null,
          shippingCity: meta.city,
          shippingPostal: meta.postalCode,
          shippingCountry: meta.country,
          shippingPhone: meta.phone || null,
          shippingMethodId: shippingMethod.id,
          shippingMethodLabel: shippingMethod.label,
          shippingCost: shippingMethod.price,
          subtotal,
          total: subtotal + shippingMethod.price,
          status: 'PROCESSING',
          buyerRequestsInvoice: Boolean(meta.buyerNif),
          buyerNif: meta.buyerNif || null,
          buyerLegalName: meta.buyerLegalName || null,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              image: item.product.image,
              unitPrice: parsePriceToNumber(item.product.price),
              quantity: item.quantity,
              selectedVariants: item.selectedVariants ?? undefined,
              taxRate: item.product.taxRate,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where });

      return order;
    });

    let invoice: Awaited<ReturnType<typeof generateInvoiceForOrder>> | null = null;
    try {
      invoice = await generateInvoiceForOrder({
        orderId: createdOrder.id,
        buyerNif: (session.metadata?.buyerNif as string) || undefined,
        buyerLegalName: (session.metadata?.buyerLegalName as string) || undefined,
      });
    } catch (error) {
      console.error('No se ha podido generar la factura del pedido:', createdOrder.orderNumber, error);
    }
    await sendOrderConfirmationEmail(createdOrder, invoice);
  } catch (error) {
    console.error('No se pudo completar el pedido tras el pago:', error);

    if (typeof session.payment_intent === 'string') {
      try {
        await stripe.refunds.create({ payment_intent: session.payment_intent });
      } catch (refundError) {
        console.error('Falló también el reembolso automático -- revisar a mano:', refundError);
      }
    }
  }
}

/**
 * Sincroniza un reembolso HECHO EN STRIPE (típicamente desde el dashboard,
 * fuera de /admin/orders) con el pedido correspondiente.
 *
 * `charge.amount_refunded` es el ACUMULADO reembolsado en ese cobro (no el
 * delta de este evento): se le pasa tal cual a applyRefundToOrder, que
 * calcula el delta y es idempotente frente a reintentos del webhook.
 *
 * IMPORTANTE: para que Stripe llegue a mandar este evento, el endpoint
 * tiene que tener suscrito "charge.refunded" (Dashboard > Developers >
 * Webhooks > tu endpoint > Select events), o en local:
 *   stripe listen --events checkout.session.completed,charge.refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.error('Evento charge.refunded sin payment_intent asociado:', charge.id);
    return;
  }

  const order = await prisma.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
  if (!order) {
    console.warn('No se ha encontrado ningún pedido para el payment_intent reembolsado:', paymentIntentId);
    return;
  }

  try {
    await applyRefundToOrder({
      orderId: order.id,
      targetRefundedAmount: charge.amount_refunded / 100,
    });
  } catch (error) {
    console.error('No se ha podido sincronizar el reembolso de Stripe con el pedido:', order.orderNumber, error);
  }
}

async function sendOrderConfirmationEmail(
  row: OrderRow,
  invoice: Awaited<ReturnType<typeof generateInvoiceForOrder>> | null
): Promise<void> {
  try {
    const order = toOrderDTO(row);
    let attachments: { filename: string; content: Buffer | string }[] | undefined;

    if (invoice) {
      const fullInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id }, include: { items: true } });
      if (fullInvoice) {
        const pdfBuffer = await renderInvoicePdf(fullInvoice);
        attachments = [{ filename: `${fullInvoice.invoiceNumber}.pdf`, content: pdfBuffer }];
      }
    }

    const result = await sendEmail({
      to: order.email,
      subject: `Confirmación de tu pedido ${order.orderNumber}`,
      html: orderConfirmationEmailHtml(order),
      attachments,
    });

    if (!result.ok) {
      console.error('No se ha podido enviar el email de confirmación del pedido:', order.orderNumber, result.error);
    }
  } catch (error) {
    console.error('Error inesperado enviando el email de confirmación del pedido:', error);
  }
}