import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import type { ProductCarouselProps } from '@/types/section.types';
import styles from './ProductCarousel.module.css';

export default function ProductCarousel({ title, viewAllLabel, viewAllHref, items = [], promos }: ProductCarouselProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {viewAllLabel && viewAllHref && (
          <Link href={viewAllHref} className={styles.viewAll}>
            {viewAllLabel}
          </Link>
        )}
      </div>

      {items.length > 0 && (
        // Misma tarjeta que en /products: mismo diseño, botón de
        // favoritos y "añadir a la cesta" con la animación al hacer hover.
        <div className={styles.itemsRow}>
          {items.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}

      {promos && promos.length > 0 && (
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
      )}
    </section>
  );
}