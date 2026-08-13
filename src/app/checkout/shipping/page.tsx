'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { shippingMethods } from '@/data/shipping.config';
import OrderSummary from '@/components/checkout/OrderSummary/OrderSummary';
import styles from '@/components/checkout/checkoutForm.module.css';

export default function CheckoutShippingPage() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const { contactInfo, shippingAddress, shippingMethod, setShippingMethod } = useCheckout();

  const [selectedId, setSelectedId] = useState(shippingMethod?.id ?? shippingMethods[0].id);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
      return;
    }
    if (!contactInfo || !shippingAddress) {
      router.replace('/checkout/information');
    }
  }, [items.length, contactInfo, shippingAddress, router]);

  if (items.length === 0 || !contactInfo || !shippingAddress) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const method = shippingMethods.find((option) => option.id === selectedId);
    if (!method) return;
    setShippingMethod(method);
    router.push('/checkout/payment');
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Link href="/checkout/information" className={styles.back}>
          ← Volver a información
        </Link>
        <h1 className={styles.title}>Método de envío</h1>
        <p className={styles.sectionTitle}>
          Enviamos a: {shippingAddress.addressLine1}, {shippingAddress.city}
        </p>

        <div className={styles.optionsList}>
          {shippingMethods.map((method) => (
            <label
              key={method.id}
              className={`${styles.optionCard} ${selectedId === method.id ? styles.optionCardSelected : ''}`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={method.id}
                checked={selectedId === method.id}
                onChange={() => setSelectedId(method.id)}
                style={{ display: 'none' }}
              />
              <div className={styles.optionInfo}>
                <span className={styles.optionLabel}>{method.label}</span>
                <span className={styles.optionEta}>{method.etaLabel}</span>
              </div>
              <span className={styles.optionPrice}>{method.priceFormatted}</span>
            </label>
          ))}
        </div>

        <button type="submit" className={styles.submit}>
          Continuar a pago
        </button>
      </form>

      <OrderSummary items={items} subtotal={subtotal} />
    </div>
  );
}