'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { createCheckoutSessionAction } from '@/lib/actions/checkout.actions';
import OrderSummary from '@/components/checkout/OrderSummary/OrderSummary';
import styles from '@/components/checkout/checkoutForm.module.css';

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { items, subtotal, hydrated: cartHydrated } = useCart();
  const { contactInfo, shippingAddress, shippingMethod, hydrated: checkoutHydrated } = useCheckout();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!cartHydrated || !checkoutHydrated) return;
    if (items.length === 0) { router.replace('/cart'); return; }
    if (!contactInfo || !shippingAddress) { router.replace('/checkout/information'); return; }
    if (!shippingMethod) router.replace('/checkout/shipping');
  }, [cartHydrated, checkoutHydrated, items.length, contactInfo, shippingAddress, shippingMethod, router]);

  if (!cartHydrated || !checkoutHydrated || items.length === 0 || !contactInfo || !shippingAddress || !shippingMethod) return null;

  async function handleCheckout() {
    setSubmitError(null);
    setIsRedirecting(true);
    try {
      const { url } = await createCheckoutSessionAction({
        email: contactInfo.email,
        shippingAddress,
        shippingMethodId: shippingMethod.id,
      });
      window.location.href = url;
    } catch (error) {
      console.error('No se pudo iniciar el pago:', error);
      setSubmitError('No se ha podido iniciar el pago. Inténtalo de nuevo.');
      setIsRedirecting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.form}>
        <Link href="/checkout/shipping" className={styles.back}>← Volver a envío</Link>
        <h1 className={styles.title}>Pago</h1>
        <p>Al confirmar te llevaremos a la pasarela de pago segura de Stripe.</p>
        {submitError && <p style={{ color: '#c0392b', fontSize: '0.85rem' }}>{submitError}</p>}
        <button type="button" className={styles.submit} onClick={handleCheckout} disabled={isRedirecting}>
          {isRedirecting ? 'Redirigiendo a Stripe...' : 'Ir a pagar'}
        </button>
      </div>
      <OrderSummary items={items} subtotal={subtotal} shippingCost={shippingMethod.price} />
    </div>
  );
}