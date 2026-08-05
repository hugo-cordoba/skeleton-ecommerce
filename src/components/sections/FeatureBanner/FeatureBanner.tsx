import Button from '@/components/ui/Button/Button';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import type { FeatureBannerProps } from '@/types/section.types';
import styles from './FeatureBanner.module.css';

export default function FeatureBanner({ title, description, ctaLabel, ctaHref, products }: FeatureBannerProps) {
  return (
    <section className={styles.section}>
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
        {ctaLabel && ctaHref && (
          <Button href={ctaHref} variant="outline">
            {ctaLabel}
          </Button>
        )}
      </div>

      {products && products.length > 0 && (
        <div className={styles.products}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
