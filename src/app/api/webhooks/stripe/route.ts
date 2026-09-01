import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { parsePriceToNumber } from '@/lib/currency';
import { shippingMethods } from '@/data/shipping.config';
import { generateOrderNumber } from '@/lib/order-number';

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
    await prisma.$transaction(async (tx) => {
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

      await tx.order.create({
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
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              image: item.product.image,
              unitPrice: parsePriceToNumber(item.product.price),
              quantity: item.quantity,
              selectedVariants: item.selectedVariants ?? undefined,
            })),
          },
        },
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
    });
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