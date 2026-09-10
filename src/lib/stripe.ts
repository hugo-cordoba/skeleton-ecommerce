import Stripe from 'stripe';
import { env } from '@/lib/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});

/** URL al dashboard de Stripe, añadiendo /test/ automáticamente si la clave es de test. */
export function stripeDashboardUrl(path: string): string {
  const isTestMode = env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  return `https://dashboard.stripe.com${isTestMode ? '/test' : ''}/${path}`;
}