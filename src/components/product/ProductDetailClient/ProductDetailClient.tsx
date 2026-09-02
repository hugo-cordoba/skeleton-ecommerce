'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { ProductDetail } from '@/types/product.types';
import { useCart } from '@/context/CartContext';
import { isInStock } from '@/data/products.config';
import styles from './ProductDetailClient.module.css';

interface ProductDetailClientProps {
  product: ProductDetail;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const inStock = isInStock(product);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  // Preselecciona la primera opción disponible de cada grupo de variante.
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants?.forEach((group) => {
      const firstAvailable = group.options.find((option) => option.available);
      if (firstAvailable) initial[group.label] = firstAvailable.label;
    });
    return initial;
  });

  const allVariantsSelected = useMemo(() => {
    if (!product.variants) return true;
    return product.variants.every((group) => Boolean(selectedVariants[group.label]));
  }, [product.variants, selectedVariants]);

  const canAddToCart = inStock && allVariantsSelected;

  function handleSelectVariant(groupLabel: string, optionLabel: string) {
    setSelectedVariants((prev) => ({ ...prev, [groupLabel]: optionLabel }));
    setFeedback(null);
  }

  function handleQuantityChange(delta: number) {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock) return product.stock;
      return next;
    });
  }

  function handleAddToCart() {
    if (!canAddToCart) return;
    addItem(product, quantity, product.variants ? selectedVariants : undefined);
    setFeedback('Añadido a la cesta.');
    setJustAdded(true);
  }

  return (
    <section className={styles.section}>
      <div className={styles.gallery}>
        <div className={styles.mainImageWrapper}>
          <Image
            src={product.images[activeImage] ?? product.image}
            alt={product.name}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.mainImage}
            priority
          />
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
        </div>

        {product.images.length > 1 && (
          <div className={styles.thumbnails}>
            {product.images.map((image, index) => (
              <button
                key={image + index}
                type="button"
                className={`${styles.thumbnail} ${index === activeImage ? styles.thumbnailActive : ''}`}
                onClick={() => setActiveImage(index)}
                aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                aria-current={index === activeImage}
              >
                <Image src={image} alt="" fill sizes="80px" className={styles.thumbnailImage} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.category}>{product.categoryLabel}</span>
        <h1 className={styles.name}>{product.name}</h1>

        <div className={styles.priceRow}>
          <span className={styles.price}>{product.price}</span>
          {product.compareAtPrice && (
            <span className={styles.compareAtPrice}>{product.compareAtPrice}</span>
          )}
        </div>

        <p className={styles.description}>{product.description}</p>

        {product.variants?.map((group) => (
          <div key={group.id} className={styles.variantGroup}>
            <span className={styles.variantLabel}>{group.label}</span>
            <div className={styles.variantOptions}>
              {group.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={!option.available}
                  className={`${styles.variantOption} ${
                    selectedVariants[group.label] === option.label ? styles.variantOptionSelected : ''
                  }`}
                  onClick={() => handleSelectVariant(group.label, option.label)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.quantityRow}>
          <span className={styles.variantLabel}>Cantidad</span>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => handleQuantityChange(-1)}
              disabled={!inStock || quantity <= 1}
              aria-label="Reducir cantidad"
            >
              −
            </button>
            <span className={styles.stepperValue}>{quantity}</span>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => handleQuantityChange(1)}
              disabled={!inStock || quantity >= product.stock}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          className={`${styles.addToCart} ${justAdded ? styles.addToCartPop : ''}`}
          onClick={handleAddToCart}
          onAnimationEnd={() => setJustAdded(false)}
          disabled={!canAddToCart}
        >
          {justAdded ? (
            <span className={styles.addToCartConfirm}>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <path d="M4 10.5 8 14l8-8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Añadido
            </span>
          ) : inStock ? (
            'Añadir a la cesta'
          ) : (
            'Agotado'
          )}
        </button>

        {!inStock && <p className={styles.stockMessage}>Este producto no tiene unidades disponibles.</p>}
        {inStock && !allVariantsSelected && (
          <p className={styles.stockMessage}>Selecciona una opción para cada variante.</p>
        )}
        {feedback && <p className={styles.feedback}>{feedback}</p>}

        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt>SKU</dt>
            <dd>{product.sku}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
