import Link from 'next/link';
import type { PromoGridProps } from '@/types/section.types';
import styles from './PromoGrid.module.css';

export default function PromoGrid({ promos }: PromoGridProps) {
  if (!promos || promos.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.promos}>
        {promos.map((promo) => (
          <Link
            key={promo.id}
            href={promo.href}
            className={styles.promoCard}
            style={promo.image ? { backgroundImage: `url(${promo.image})` } : undefined}
          >
            {promo.tag && <span className={styles.promoTag}>{promo.tag}</span>}
            <p className={styles.promoTitle}>{promo.title}</p>
            {promo.ctaLabel && (
              <span className={styles.promoCta}>
                {promo.ctaLabel} <span aria-hidden="true">&#8594;</span>
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}