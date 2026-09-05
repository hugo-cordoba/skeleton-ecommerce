'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  createProductAction,
  updateProductAction,
  type AdminProductDetail,
  type ProductFormInput,
} from '@/lib/actions/admin/product.actions';
import formStyles from '@/components/checkout/checkoutForm.module.css';
import styles from './ProductForm.module.css';

interface OptionItem {
  slug: string;
  label: string;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initialData?: AdminProductDetail;
  categories: OptionItem[];
  brands: OptionItem[];
}

export default function ProductForm({ mode, productId, initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [sku, setSku] = useState(initialData?.sku ?? '');
  const [price, setPrice] = useState(initialData?.price ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice ?? '');
  const [image, setImage] = useState(initialData?.image ?? '');
  const [imagesText, setImagesText] = useState((initialData?.images ?? []).join('\n'));
  const [badge, setBadge] = useState(initialData?.badge ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? '');
  const [stock, setStock] = useState(initialData?.stock ?? 0);
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug ?? categories[0]?.slug ?? '');
  const [brandSlug, setBrandSlug] = useState(initialData?.brandSlug ?? '');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const images = imagesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const input: ProductFormInput = {
      name,
      slug,
      sku,
      price,
      compareAtPrice: compareAtPrice || undefined,
      image,
      images,
      badge: badge || undefined,
      description,
      shortDescription: shortDescription || undefined,
      stock,
      categorySlug,
      brandSlug: brandSlug || undefined,
    };

    const result =
      mode === 'create' ? await createProductAction(input) : await updateProductAction(productId!, input);

    // Si todo va bien, la server action redirige (lanza NEXT_REDIRECT) y
    // no llegamos aqui. Si llegamos, es que hubo un error de validacion.
    setIsSubmitting(false);
    if (result && !result.ok) setError(result.error ?? 'No se ha podido guardar el producto.');
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <div className={formStyles.row}>
        <label className={formStyles.field}>
          <span className={formStyles.label}>Nombre</span>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={formStyles.input} />
        </label>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Slug (opcional, se genera del nombre)</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={formStyles.input}
            placeholder="mi-producto"
          />
        </label>
      </div>

      <div className={formStyles.row}>
        <label className={formStyles.field}>
          <span className={formStyles.label}>SKU</span>
          <input type="text" required value={sku} onChange={(e) => setSku(e.target.value)} className={formStyles.input} />
        </label>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Stock</span>
          <input
            type="number"
            required
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className={formStyles.input}
          />
        </label>
      </div>

      <div className={formStyles.row}>
        <label className={formStyles.field}>
          <span className={formStyles.label}>Precio (ej. 24,90 EUR)</span>
          <input type="text" required value={price} onChange={(e) => setPrice(e.target.value)} className={formStyles.input} />
        </label>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Precio anterior (opcional)</span>
          <input
            type="text"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            className={formStyles.input}
          />
        </label>
      </div>

      <div className={formStyles.row}>
        <label className={formStyles.field}>
          <span className={formStyles.label}>Categoría</span>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className={formStyles.input}
            required
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Marca (opcional)</span>
          <select value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} className={formStyles.input}>
            <option value="">Sin marca</option>
            {brands.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={formStyles.field}>
        <span className={formStyles.label}>Etiqueta (opcional, ej. &quot;Nuevo&quot;, &quot;Más vendido&quot;)</span>
        <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} className={formStyles.input} />
      </label>

      <label className={formStyles.field}>
        <span className={formStyles.label}>Imagen principal (URL)</span>
        <input
          type="text"
          required
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className={formStyles.input}
          placeholder="https://..."
        />
      </label>

      <label className={formStyles.field}>
        <span className={formStyles.label}>Imágenes de galería (una URL por línea, opcional)</span>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          className={styles.textarea}
          rows={3}
        />
      </label>

      <label className={formStyles.field}>
        <span className={formStyles.label}>Descripción corta (opcional)</span>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className={formStyles.input}
        />
      </label>

      <label className={formStyles.field}>
        <span className={formStyles.label}>Descripción</span>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          rows={5}
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" className={formStyles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </button>
        <button type="button" className={styles.cancelButton} onClick={() => router.push('/admin/products')}>
          Cancelar
        </button>
      </div>
    </form>
  );
}