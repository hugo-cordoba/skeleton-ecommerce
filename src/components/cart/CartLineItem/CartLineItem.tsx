import Image from 'next/image';
import Link from 'next/link';
import type { CartItem } from '@/context/CartContext';
import { formatPrice } from '@/lib/currency';
import styles from './CartLineItem.module.css';

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const variantSummary = item.selectedVariants
    ? Object.entries(item.selectedVariants)
        .map(([group, option]) => `${group}: ${option}`)
        .join(' · ')
    : null;

  const isLastUnit = item.quantity === 1;

  return (
    <div className={styles.row}>
      <Link href={`/products/${item.slug}`} className={styles.imageWrapper}>
        <Image src={item.image} alt={item.name} fill sizes="100px" className={styles.image} />
      </Link>

      <div className={styles.details}>
        <Link href={`/products/${item.slug}`} className={styles.name}>
          {item.name}
        </Link>
        {variantSummary && <span className={styles.variants}>{variantSummary}</span>}
        <span className={styles.unitPrice}>{formatPrice(item.unitPrice)}</span>
      </div>

      <div className={styles.stepper}>
        {isLastUnit ? (
          <button
            type="button"
            className={`${styles.stepperButton} ${styles.stepperButtonDanger}`}
            onClick={() => onRemove(item.id)}
            aria-label={`Eliminar ${item.name} de la cesta`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 .8 12.1A2 2 0 0 0 7.8 21h8.4a2 2 0 0 0 2-1.9L19 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            className={styles.stepperButton}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            aria-label={`Reducir cantidad de ${item.name}`}
          >
            −
          </button>
        )}
        <span className={styles.stepperValue}>{item.quantity}</span>
        <button
          type="button"
          className={styles.stepperButton}
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= item.maxStock}
          aria-label={`Aumentar cantidad de ${item.name}`}
        >
          +
        </button>
      </div>

      <span className={styles.lineTotal}>{formatPrice(item.unitPrice * item.quantity)}</span>
    </div>
  );
}