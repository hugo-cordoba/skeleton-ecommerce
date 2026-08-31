'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { useOrders } from '@/context/OrdersContext';
import { createOrderAction } from '@/lib/actions/order.actions';
import OrderSummary from '@/components/checkout/OrderSummary/OrderSummary';
import styles from '@/components/checkout/checkoutForm.module.css';

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, hydrated: cartHydrated } = useCart();
  const { contactInfo, shippingAddress, shippingMethod, hydrated: checkoutHydrated, completeOrder } = useCheckout();
  const { addOrder } = useOrders();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!cartHydrated || !checkoutHydrated) return;
    if (items.length === 0) {
      router.replace('/cart');
      return;
    }
    if (!contactInfo || !shippingAddress) {
      router.replace('/checkout/information');
      return;
    }
    if (!shippingMethod) {
      router.replace('/checkout/shipping');
    }
  }, [cartHydrated, checkoutHydrated, items.length, contactInfo, shippingAddress, shippingMethod, router]);

  if (!cartHydrated || !checkoutHydrated || items.length === 0 || !contactInfo || !shippingAddress || !shippingMethod) return null;

  const confirmedContactInfo = contactInfo;
  const confirmedShippingAddress = shippingAddress;
  const confirmedShippingMethod = shippingMethod;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const order = await createOrderAction({
        email: confirmedContactInfo.email,
        shippingAddress: confirmedShippingAddress,
        shippingMethod: confirmedShippingMethod,
        items,
        subtotal,
      });

      completeOrder(order);
      addOrder(order);
      clearCart();
      router.push('/checkout/success');
    } catch (error) {
      console.error('No se pudo crear el pedido:', error);
      setSubmitError('No se ha podido confirmar el pedido. Inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Link href="/checkout/shipping" className={styles.back}>
          ← Volver a envío
        </Link>
        <h1 className={styles.title}>Pago</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Tarjeta (simulado)</h2>

          <label className={styles.field}>
            <span className={styles.label}>Nombre en la tarjeta</span>
            <input
              type="text"
              required
              value={cardName}
              onChange={(event) => setCardName(event.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Número de tarjeta</span>
            <input
              type="text"
              required
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
              className={styles.input}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Caducidad</span>
              <input
                type="text"
                required
                placeholder="MM/AA"
                value={expiry}
                onChange={(event) => setExpiry(event.target.value)}
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>CVC</span>
              <input
                type="text"
                required
                inputMode="numeric"
                placeholder="123"
                value={cvc}
                onChange={(event) => setCvc(event.target.value)}
                className={styles.input}
              />
            </label>
          </div>
        </div>

        {submitError && <p style={{ color: '#c0392b', fontSize: '0.85rem' }}>{submitError}</p>}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
        </button>
      </form>

      <OrderSummary items={items} subtotal={subtotal} shippingCost={shippingMethod.price} />
    </div>
  );
}