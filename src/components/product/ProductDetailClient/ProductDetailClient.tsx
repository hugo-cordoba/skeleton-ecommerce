'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { ProductDetail } from '@/types/product.types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { isInStock } from '@/data/products.config';
import styles from './ProductDetailClient.module.css';

type TabKey = 'description' | 'benefit' | 'details' | 'returns';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'description', label: 'Descripción' },
  { key: 'benefit', label: 'Beneficios' },
  { key: 'details', label: 'Detalles' },
  { key: 'returns', label: 'Devoluciones' },
];

interface ProductDetailClientProps {
  product: ProductDetail;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inStock = isInStock(product);
  const isFavorite = isInWishlist(product.id);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('description');

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
      {/* Galería: miniaturas en columna a la izquierda, imagen principal a la derecha */}
      <div className={styles.gallery}>
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
                <Image src={image} alt="" fill sizes="56px" className={styles.thumbnailImage} />
              </button>
            ))}
          </div>
        )}

        <div className={styles.mainImageWrapper}>
          <Image
            src={product.images[activeImage] ?? product.image}
            alt={product.name}
            fill
            sizes="(max-width: 900px) 100vw, 760px"
            className={styles.mainImage}
            priority
          />
        </div>
      </div>

      <div className={styles.info}>
        {/* Fila superior: categoría/marca + título a la izquierda, badge a la derecha */}
        <div className={styles.topRow}>
          <div>
            <span className={styles.eyebrowLine}>
              {product.categoryLabel}
              {product.brandLabel ? ` · ${product.brandLabel}` : ''}
            </span>
            <h1 className={styles.name}>{product.name}</h1>
          </div>
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>{product.price}</span>
          {product.compareAtPrice && (
            <span className={styles.compareAtPrice}>{product.compareAtPrice}</span>
          )}
        </div>

        {/* Bloque "Cantidad y opciones": variantes (si las hay) + stepper y stock */}
        <div className={styles.amountSection}>
          <span className={styles.sectionLabel}>Cantidad y opciones</span>

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

          <div className={styles.stepperRow}>
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
            <span className={styles.stockText}>
              {inStock ? `Stock actual: ${product.stock}` : 'Sin stock disponible'}
            </span>
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
                <path
                  d="M4 10.5 8 14l8-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Añadido
            </span>
          ) : inStock ? (
            'Añadir a la cesta'
          ) : (
            'Agotado'
          )}
        </button>

        <button
          type="button"
          className={styles.favoriteButton}
          onClick={() => toggleItem(product)}
          aria-pressed={isFavorite}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          {isFavorite ? 'Guardado en favoritos' : 'Favorito'}
        </button>

        {!inStock && <p className={styles.stockMessage}>Este producto no tiene unidades disponibles.</p>}
        {inStock && !allVariantsSelected && (
          <p className={styles.stockMessage}>Selecciona una opción para cada variante.</p>
        )}
        {feedback && <p className={styles.feedback}>{feedback}</p>}

        {/* Pestañas: sustituyen a la descripción suelta + metadatos */}
        <div className={styles.tabs}>
          <div className={styles.tabList} role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.tabPanel} role="tabpanel">
            {activeTab === 'description' && <p>{product.description}</p>}

            {activeTab === 'benefit' && <p>{product.shortDescription ?? product.description}</p>}

            {activeTab === 'details' && (
              <dl className={styles.detailsList}>
                <div className={styles.detailsRow}>
                  <dt>SKU</dt>
                  <dd>{product.sku}</dd>
                </div>
                <div className={styles.detailsRow}>
                  <dt>Categoría</dt>
                  <dd>{product.categoryLabel}</dd>
                </div>
                {product.brandLabel && (
                  <div className={styles.detailsRow}>
                    <dt>Marca</dt>
                    <dd>{product.brandLabel}</dd>
                  </div>
                )}
              </dl>
            )}

            {activeTab === 'returns' && (
              <p>
                Consulta nuestra política de devoluciones en la página de{' '}
                <a href="/returns">Devoluciones</a>.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}