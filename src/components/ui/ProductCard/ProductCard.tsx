import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product.types';
import WishlistButton from '@/components/ui/WishlistButton/WishlistButton';
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

  return (
    <div className={styles.cardWrapper}>
      {product.href ? (
        <Link href={product.href} className={styles.card}>
          {content}
        </Link>
      ) : (
        <div className={styles.card}>{content}</div>
      )}
      <WishlistButton product={product} />
    </div>
  );
}