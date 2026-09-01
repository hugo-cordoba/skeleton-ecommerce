'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { readGuestId } from '@/lib/guest';
import { parsePriceToNumber } from '@/lib/currency';
import { shippingMethods } from '@/data/shipping.config';
import type { ShippingAddress } from '@/types/order.types';

interface CreateCheckoutSessionInput {
  email: string;
  shippingAddress: ShippingAddress;
  shippingMethodId: string;
}

/**
 * Crea la sesión de Stripe Checkout y devuelve la URL a la que redirigir.
 * Los precios se recalculan aquí desde la BD -- nunca se confía en lo que
 * mande el cliente, así se evita manipulación de precios en el checkout.
 */
export async function createCheckoutSessionAction(
  input: CreateCheckoutSessionInput
): Promise<{ url: string }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const guestId = userId ? undefined : readGuestId();
  if (!userId && !guestId) throw new Error('No se pudo identificar el carrito.');

  const where = userId ? { userId } : { guestId };
  const cartItems = await prisma.cartItem.findMany({ where, include: { product: true } });
  if (cartItems.length === 0) throw new Error('El carrito está vacío.');

  const shippingMethod = shippingMethods.find((method) => method.id === input.shippingMethodId);
  if (!shippingMethod) throw new Error('Método de envío no válido.');

  const lineItems = cartItems.map((item) => {
    // Stripe requiere URLs absolutas para las imágenes
    const imageUrl = item.product.image.startsWith('http')
      ? item.product.image
      : `${process.env.NEXTAUTH_URL}${item.product.image}`;

    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product.name,
          images: [imageUrl]
        },
        unit_amount: Math.round(parsePriceToNumber(item.product.price) * 100),
      },
      quantity: item.quantity,
    };
  });

  if (shippingMethod.price > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: `Envío: ${shippingMethod.label}`, images: [] },
        unit_amount: Math.round(shippingMethod.price * 100),
      },
      quantity: 1,
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: input.email,
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout/payment`,
    metadata: {
      ...(userId ? { userId } : { guestId: guestId! }),
      shippingMethodId: shippingMethod.id,
      email: input.email,
      fullName: input.shippingAddress.fullName,
      addressLine1: input.shippingAddress.addressLine1,
      addressLine2: input.shippingAddress.addressLine2 ?? '',
      city: input.shippingAddress.city,
      postalCode: input.shippingAddress.postalCode,
      country: input.shippingAddress.country,
      phone: input.shippingAddress.phone ?? '',
    },
  });

  if (!checkoutSession.url) throw new Error('Stripe no ha devuelto una URL de pago.');
  return { url: checkoutSession.url };
}