'use client';

import { useRef } from 'react';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import type { ProductCarouselProps } from '@/types/section.types';
import styles from './ProductCarousel.module.css';

export default function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.controls}>
          <button type="button" aria-label="Anterior" onClick={() => scroll('left')} className={styles.arrow}>
            &#8249;
          </button>
          <button type="button" aria-label="Siguiente" onClick={() => scroll('right')} className={styles.arrow}>
            &#8250;
          </button>
        </div>
      </div>

      <div className={styles.track} ref={trackRef}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
