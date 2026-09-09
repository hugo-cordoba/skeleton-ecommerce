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

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
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

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          stripeSessionId: session.id,
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

      // Descuento de stock real (punto 2), en la misma transacción que
      // crea el pedido: nunca queda un pedido sin su stock reflejado.
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
    // A partir de aquí el pedido ya está persistido y el pago confirmado.
    // El email es "best effort": si falla el envío NO revertimos el pedido
    // ni disparamos el reembolso automático del catch de abajo -- ese
    // reembolso es solo para cuando el pedido en sí no se pudo crear.
    await sendOrderConfirmationEmail(createdOrder, invoice);
  } catch (error) {
    console.error('No se pudo completar el pedido tras el pago:', error);

    // Ya se ha cobrado pero no se ha podido crear el pedido (normalmente
    // por falta de stock de última hora) -> reembolso automático en vez
    // de dejar un cobro huérfano sin pedido asociado.
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
 * Envía el email de confirmación tras un pago con éxito. Reutiliza el
 * mismo helper (sendEmail + orderConfirmationEmailHtml + toOrderDTO) que
 * usa el botón "Reenviar email" de /admin/orders/[orderNumber], así el
 * formato es idéntico en ambos casos. Nunca lanza: un fallo de envío se
 * registra en logs pero no debe afectar al pedido, que ya está creado y
 * pagado en este punto.
 */
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