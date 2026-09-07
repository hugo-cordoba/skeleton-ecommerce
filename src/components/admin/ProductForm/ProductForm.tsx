'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import {
  createProductAction,
  updateProductAction,
  type AdminProductDetail,
  type AdminVariantGroupInput,
  type OptionDTO,
  type ProductFormInput,
} from '@/lib/actions/admin/products.actions';
import type { ProductStatus } from '@/types/product.types';
import formStyles from '@/components/checkout/checkoutForm.module.css';
import styles from './ProductForm.module.css';
import ImageUploadField from '@/components/admin/ImageUploadField/ImageUploadField';
import { deleteProductImageAction } from '@/lib/actions/admin/upload.actions';

interface VariantOptionState {
  localId: string;
  label: string;
  available: boolean;
}

interface VariantGroupState {
  localId: string;
  label: string;
  options: VariantOptionState[];
}

interface ImageState {
  localId: string;
  url: string;
}

let localIdCounter = 0;
function nextLocalId(): string {
  localIdCounter += 1;
  return `local-${localIdCounter}`;
}

function toVariantGroupState(groups: AdminVariantGroupInput[]): VariantGroupState[] {
  return groups.map((group) => ({
    localId: nextLocalId(),
    label: group.label,
    options: group.options.map((option) => ({
      localId: nextLocalId(),
      label: option.label,
      available: option.available,
    })),
  }));
}

interface ProductFormProps {
  product?: AdminProductDetail;
  categories: OptionDTO[];
  brands: OptionDTO[];
}

export default function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [sku, setSku] = useState(product?.sku ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice != null ? String(product.compareAtPrice) : ''
  );
  const [stock, setStock] = useState(product ? String(product.stock) : '0');
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'ACTIVE');
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? categories[0]?.slug ?? '');
  const [brandSlug, setBrandSlug] = useState(product?.brandSlug ?? '');
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? '');

  const [images, setImages] = useState<ImageState[]>(() =>
    product && product.images.length > 0
      ? product.images.map((url) => ({ localId: nextLocalId(), url }))
      : [{ localId: nextLocalId(), url: '' }]
  );

  const [variantGroups, setVariantGroups] = useState<VariantGroupState[]>(() =>
    product ? toVariantGroupState(product.variantGroups) : []
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(value);
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  function addImage() {
    setImages((prev) => [...prev, { localId: nextLocalId(), url: '' }]);
  }

  function updateImage(localId: string, url: string) {
    setImages((prev) => prev.map((image) => (image.localId === localId ? { ...image, url } : image)));
  }

  function removeImage(localId: string) {
    setImages((prev) => (prev.length > 1 ? prev.filter((image) => image.localId !== localId) : prev));
  }

  function addVariantGroup() {
    setVariantGroups((prev) => [
      ...prev,
      { localId: nextLocalId(), label: '', options: [{ localId: nextLocalId(), label: '', available: true }] },
    ]);
  }

  function removeVariantGroup(groupId: string) {
    setVariantGroups((prev) => prev.filter((group) => group.localId !== groupId));
  }

  function updateVariantGroupLabel(groupId: string, label: string) {
    setVariantGroups((prev) => prev.map((group) => (group.localId === groupId ? { ...group, label } : group)));
  }

  function addVariantOption(groupId: string) {
    setVariantGroups((prev) =>
      prev.map((group) =>
        group.localId === groupId
          ? { ...group, options: [...group.options, { localId: nextLocalId(), label: '', available: true }] }
          : group
      )
    );
  }

  function updateVariantOption(
    groupId: string,
    optionId: string,
    patch: Partial<Omit<VariantOptionState, 'localId'>>
  ) {
    setVariantGroups((prev) =>
      prev.map((group) =>
        group.localId === groupId
          ? {
              ...group,
              options: group.options.map((option) =>
                option.localId === optionId ? { ...option, ...patch } : option
              ),
            }
          : group
      )
    );
  }

  function removeVariantOption(groupId: string, optionId: string) {
    setVariantGroups((prev) =>
      prev.map((group) =>
        group.localId === groupId && group.options.length > 1
          ? { ...group, options: group.options.filter((option) => option.localId !== optionId) }
          : group
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const priceNumber = Number(price);
    const compareAtPriceNumber = compareAtPrice.trim() ? Number(compareAtPrice) : null;
    const stockNumber = Number(stock);

    if (!Number.isFinite(priceNumber)) return setFormError('El precio no es un número válido.');
    if (compareAtPriceNumber !== null && !Number.isFinite(compareAtPriceNumber)) {
      return setFormError('El precio tachado no es un número válido.');
    }
    if (!Number.isFinite(stockNumber)) return setFormError('El stock no es un número válido.');

    const input: ProductFormInput = {
      name,
      slug,
      price: priceNumber,
      compareAtPrice: compareAtPriceNumber,
      images: images.map((image) => image.url),
      description,
      shortDescription,
      sku,
      stock: stockNumber,
      status,
      categorySlug,
      brandSlug: brandSlug || undefined,
      badge,
      variantGroups: variantGroups.map((group) => ({
        label: group.label,
        options: group.options.map((option) => ({ label: option.label, available: option.available })),
      })),
    };

    setIsSubmitting(true);
    const result = product ? await updateProductAction(product.id, input) : await createProductAction(input);
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    // Limpieza best-effort de R2: imágenes que estaban en el producto y ya no
    // están en el guardado final. Solo tiene sentido al editar (en creación no
    // hay nada previo que limpiar).
    if (product) {
      const finalUrls = new Set(input.images.filter(Boolean));
      const removedUrls = product.images.filter((url) => !finalUrls.has(url));
      removedUrls.forEach((url) => {
        void deleteProductImageAction(url);
      });
    }

    router.push('/admin/products');
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <h1 className={formStyles.title}>{isEditing ? `Editar ${product!.name}` : 'Nuevo producto'}</h1>

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Información básica</h2>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Nombre</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={formStyles.input}
          />
        </label>

        <label className={formStyles.field}>
          <span className={formStyles.label}>Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className={formStyles.input}
          />
          <span className={styles.hint}>URL: /products/{slugify(slug || name) || '...'}</span>
        </label>

        <div className={formStyles.row}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>SKU</span>
            <input type="text" required value={sku} onChange={(e) => setSku(e.target.value)} className={formStyles.input} />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Insignia (opcional, ej. &quot;Best Seller&quot;)</span>
            <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} className={formStyles.input} />
          </label>
        </div>

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
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
          />
        </label>
      </div>

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Precio e inventario</h2>

        <div className={formStyles.row}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Precio (EUR)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={formStyles.input}
            />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Precio tachado (opcional)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              className={formStyles.input}
            />
          </label>
        </div>

        <div className={formStyles.row}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Stock</span>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={formStyles.input}
            />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Estado</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className={formStyles.input}>
              <option value="ACTIVE">Activo</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </label>
        </div>
      </div>

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Categoría y marca</h2>

        <div className={formStyles.row}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Categoría</span>
            <select required value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className={formStyles.input}>
              {categories.length === 0 && <option value="">Crea antes una categoría</option>}
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
      </div>

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Imágenes</h2>
        <p className={styles.hint}>
          Sube una imagen (se guarda en R2) o pega la URL de una ya subida. La primera es la imagen principal del listado.
        </p>

        {images.map((image, index) => (
          <div key={image.localId} className={styles.repeatableRow}>
            <ImageUploadField
              value={image.url}
              onChange={(url) => updateImage(image.localId, url)}
              required={index === 0}
            />
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeImage(image.localId)}
              disabled={images.length === 1}
            >
              Quitar
            </button>
          </div>
        ))}

        <button type="button" className={styles.addRowButton} onClick={addImage}>
          + Añadir imagen
        </button>
      </div>

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Variantes (opcional)</h2>
        <p className={styles.hint}>
          Ej. un grupo &quot;Talla&quot; con opciones S/M/L, o &quot;Color&quot; con Negro/Azul.
        </p>

        {variantGroups.map((group) => (
          <div key={group.localId} className={styles.variantGroup}>
            <div className={styles.variantGroupHeader}>
              <input
                type="text"
                placeholder="Nombre del grupo (ej. Talla)"
                value={group.label}
                onChange={(e) => updateVariantGroupLabel(group.localId, e.target.value)}
                className={formStyles.input}
              />
              <button type="button" className={styles.removeButton} onClick={() => removeVariantGroup(group.localId)}>
                Quitar grupo
              </button>
            </div>

            {group.options.map((option) => (
              <div key={option.localId} className={styles.repeatableRow}>
                <input
                  type="text"
                  placeholder="Opción (ej. M)"
                  value={option.label}
                  onChange={(e) => updateVariantOption(group.localId, option.localId, { label: e.target.value })}
                  className={formStyles.input}
                />
                <label className={styles.availableCheck}>
                  <input
                    type="checkbox"
                    checked={option.available}
                    onChange={(e) =>
                      updateVariantOption(group.localId, option.localId, { available: e.target.checked })
                    }
                  />
                  Disponible
                </label>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeVariantOption(group.localId, option.localId)}
                  disabled={group.options.length === 1}
                >
                  Quitar
                </button>
              </div>
            ))}

            <button type="button" className={styles.addRowButton} onClick={() => addVariantOption(group.localId)}>
              + Añadir opción
            </button>
          </div>
        ))}

        <button type="button" className={styles.addRowButton} onClick={addVariantGroup}>
          + Añadir grupo de variante
        </button>
      </div>

      {formError && <p className={styles.error}>{formError}</p>}

      <div className={styles.formActions}>
        <button type="submit" className={formStyles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button type="button" className={styles.cancelButton} onClick={() => router.push('/admin/products')}>
          Cancelar
        </button>
      </div>
    </form>
  );
}