'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductCarouselProps } from '@/types/section.types';
import styles from './ProductCarousel.module.css';

export default function ProductCarousel({ title, viewAllLabel, viewAllHref, items, promos }: ProductCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8 * direction, behavior: 'smooth' });
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.headerRight}>
          {viewAllLabel && viewAllHref && (
            <Link href={viewAllHref} className={styles.viewAll}>
              {viewAllLabel}
            </Link>
          )}
          <div className={styles.controls}>
            <button type="button" className={styles.navButton} onClick={() => scrollByAmount(-1)} aria-label="Anterior">
              &#8592;
            </button>
            <button type="button" className={styles.navButton} onClick={() => scrollByAmount(1)} aria-label="Siguiente">
              &#8594;
            </button>
          </div>
        </div>
      </div>

      <div className={styles.itemsRow} ref={scrollerRef}>
        {items.map((item) => {
          const content = (
            <>
              <div className={styles.itemImageWrapper}>
                <Image src={item.image} alt={item.name} fill sizes="200px" className={styles.itemImage} />
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