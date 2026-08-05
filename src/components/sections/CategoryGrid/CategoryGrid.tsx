import Image from 'next/image';
import Link from 'next/link';
import type { CategoryGridProps } from '@/types/section.types';
import styles from './CategoryGrid.module.css';

export default function CategoryGrid({ title, categories }: CategoryGridProps) {
  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.grid}>
        {categories.map((category) => {
          const tileContent = (
            <>
              <Image
                src={category.image}
                alt={category.label}
                fill
                sizes="(max-width: 768px) 45vw, 22vw"
                className={styles.image}
              />
              <span className={styles.label}>{category.label}</span>
            </>
          );

          return category.href ? (
            <Link key={category.label} href={category.href} className={styles.tile}>
              {tileContent}
            </Link>
          ) : (
            <div key={category.label} className={styles.tile}>
              {tileContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}
