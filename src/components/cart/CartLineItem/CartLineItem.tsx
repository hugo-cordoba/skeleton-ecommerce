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
        <span className={styles.unitPrice}>{item.price}</span>

        <button type="button" className={styles.remove} onClick={() => onRemove(item.id)}>
          Eliminar
        </button>
      </div>

      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepperButton}
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label={`Reducir cantidad de ${item.name}`}
        >
          −
        </button>
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