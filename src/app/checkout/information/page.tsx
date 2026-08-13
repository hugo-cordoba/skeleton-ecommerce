'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import styles from '@/components/checkout/checkoutForm.module.css';

export default function CheckoutInformationPage() {
  const router = useRouter();
  const { items, hydrated: cartHydrated } = useCart();
  const { contactInfo, shippingAddress, hydrated: checkoutHydrated, setContactInfo, setShippingAddress } = useCheckout();

  const [email, setEmail] = useState(contactInfo?.email ?? '');
  const [fullName, setFullName] = useState(shippingAddress?.fullName ?? '');
  const [addressLine1, setAddressLine1] = useState(shippingAddress?.addressLine1 ?? '');
  const [addressLine2, setAddressLine2] = useState(shippingAddress?.addressLine2 ?? '');
  const [city, setCity] = useState(shippingAddress?.city ?? '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode ?? '');
  const [country, setCountry] = useState(shippingAddress?.country ?? 'España');
  const [phone, setPhone] = useState(shippingAddress?.phone ?? '');

  // Sin cesta no hay nada que tramitar.
  useEffect(() => {
    if (!cartHydrated) return;
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [cartHydrated, items.length, router]);

  if (!cartHydrated || !checkoutHydrated || items.length === 0) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactInfo({ email });
    setShippingAddress({
      fullName,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      postalCode,
      country,
      phone: phone || undefined,
    });
    router.push('/checkout/shipping');
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Link href="/cart" className={styles.back}>
          ← Volver a la cesta
        </Link>
        <h1 className={styles.title}>Datos de contacto y envío</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contacto</h2>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
            />
          </label>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Dirección de envío</h2>

          <label className={styles.field}>
            <span className={styles.label}>Nombre completo</span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Dirección</span>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(event) => setAddressLine1(event.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Piso, puerta... (opcional)</span>
            <input
              type="text"
              value={addressLine2}
              onChange={(event) => setAddressLine2(event.target.value)}
              className={styles.input}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Ciudad</span>
              <input
                type="text"
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Código postal</span>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>País</span>
              <input
                type="text"
                required
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Teléfono (opcional)</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={styles.input}
              />
            </label>
          </div>
        </div>

        <button type="submit" className={styles.submit}>
          Continuar a envío
        </button>
      </form>
    </div>
  );
}