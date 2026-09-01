'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import { getOrderBySessionId } from '@/lib/actions/order.actions';
import { formatPrice } from '@/lib/currency';
import styles from './SuccessPage.module.css';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetCheckout } = useCheckout();
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrderBySessionId>>>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'pending'>('loading');

  useEffect(() => {
    if (!sessionId) { router.replace('/'); return; }
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      const result = await getOrderBySessionId(sessionId!);
      if (cancelled) return;
      if (result) {
        setOrder(result);
        setStatus('ready');
        resetCheckout();
        return;
      }
      attempts += 1;
      if (attempts < 8) setTimeout(poll, 2000);
      else setStatus('pending');
    }

    poll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (status === 'loading') {
    return <div className={styles.page}><p>Confirmando tu pedido...</p></div>;
  }

  if (status === 'pending' || !order) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <span className={styles.badge}>Pago recibido</span>
          <h1 className={styles.title}>Estamos confirmando tu pedido</h1>
          <p className={styles.subtitle}>
            Tu pago se ha procesado correctamente. En unos minutos recibirás un email con los detalles.
          </p>
        </div>
        <Link href="/" className={styles.cta}>Volver a la tienda</Link>
      </div>
    );
  }

  const { orderNumber, email, shippingAddress, shippingMethod, items, total } = order;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.badge}>Pedido confirmado</span>
        <h1 className={styles.title}>¡Gracias por tu compra!</h1>
        <p className={styles.subtitle}>Hemos enviado la confirmación a <strong>{email}</strong>.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Número de pedido</span>
          <span className={styles.cardValue}>{orderNumber}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Envío</span>
          <span className={styles.cardValue}>{shippingMethod.label}</span>
          <span className={styles.cardSubvalue}>{shippingMethod.etaLabel}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Dirección</span>
          <span className={styles.cardValue}>{shippingAddress.addressLine1}, {shippingAddress.city}</span>
          <span className={styles.cardSubvalue}>{shippingAddress.postalCode}, {shippingAddress.country}</span>
        </div>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.itemName}>{item.name} <span className={styles.itemQuantity}>× {item.quantity}</span></span>
            <span className={styles.itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className={styles.total}><span>Total</span><span>{formatPrice(total)}</span></div>
      </div>

      <Link href="/" className={styles.cta}>Volver a la tienda</Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className={styles.page}><p>Cargando...</p></div>}>
      <SuccessContent />
    </Suspense>
  );
}