import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { CheckoutProvider } from '@/context/CheckoutContext';
import CheckoutSteps from '@/components/checkout/CheckoutSteps/CheckoutSteps';
import styles from './Checkout.module.css';

const steps = [
  { label: 'Información', href: '/checkout/information' },
  { label: 'Envío', href: '/checkout/shipping' },
  { label: 'Pago', href: '/checkout/payment' },
];

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <CheckoutProvider>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <Link href="/" className={styles.logo}>
            {siteConfig.name}
          </Link>
          <CheckoutSteps steps={steps} />
        </header>
        <main>{children}</main>
      </div>
    </CheckoutProvider>
  );
}