import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product.types';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }: { product: Product }) {
  const content = (
    <>
      <div className={styles.imageWrapper}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 60vw, 320px"
          className={styles.image}
        />
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>{product.price}</p>
      </div>
    </>
  );

  if (product.href) {
    return (
      <Link href={product.href} className={styles.card}>
        {content}
      </Link>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
