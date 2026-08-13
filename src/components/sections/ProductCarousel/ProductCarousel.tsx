import Image from 'next/image';
import Link from 'next/link';
import type { ProductCarouselProps } from '@/types/section.types';
import styles from './ProductCarousel.module.css';

export default function ProductCarousel({ title, viewAllLabel, viewAllHref, items, promos }: ProductCarouselProps) {
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

      <div className={styles.itemsRow}>
        {items.map((item) => {
          const content = (
            <>
              <div className={styles.itemImageWrapper}>
                <Image src={item.image} alt={item.name} fill sizes="160px" className={styles.itemImage} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>{item.price}</span>
              </div>
            </>
          );

          return item.href ? (
            <Link key={item.id} href={item.href} className={styles.item}>
              {content}
            </Link>
          ) : (
            <div key={item.id} className={styles.item}>
              {content}
            </div>
          );
        })}
      </div>

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