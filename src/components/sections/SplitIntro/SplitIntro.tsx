import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import type { SplitIntroProps } from '@/types/section.types';
import styles from './SplitIntro.module.css';

export default function SplitIntro({
  eyebrow,
  title,
  description,
  image,
  imagePosition = 'right',
  ctaLabel,
  ctaHref,
}: SplitIntroProps) {
  return (
    <section className={`${styles.section} ${imagePosition === 'left' ? styles.reversed : ''}`}>
      <div className={styles.text}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        {ctaLabel && ctaHref && (
          <Button href={ctaHref} variant="outline">
            {ctaLabel}
          </Button>
        )}
      </div>
      <div className={styles.imageWrapper}>
        <Image src={image} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.image} />
      </div>
    </section>
  );
}
