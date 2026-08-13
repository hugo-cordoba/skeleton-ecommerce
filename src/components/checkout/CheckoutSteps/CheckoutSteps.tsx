'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './CheckoutSteps.module.css';

interface Step {
  label: string;
  href: string;
}

export default function CheckoutSteps({ steps }: { steps: Step[] }) {
  const pathname = usePathname();
  const activeIndex = steps.findIndex((step) => pathname?.startsWith(step.href));

  return (
    <nav aria-label="Progreso del pedido">
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = activeIndex > index;

          return (
            <li key={step.href} className={styles.item}>
              <Link
                href={step.href}
                className={`${styles.link} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              >
                <span className={styles.number}>{index + 1}</span>
                <span className={styles.stepLabel}>{step.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}