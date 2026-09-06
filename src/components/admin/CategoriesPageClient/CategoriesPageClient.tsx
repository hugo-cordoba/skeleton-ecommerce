'use client';

import { useState, type FormEvent } from 'react';
import { slugify } from '@/lib/slugify';
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryDTO,
} from '@/lib/actions/admin/categories.actions';
import formStyles from '@/components/checkout/checkoutForm.module.css';
import styles from './CategoriesPageClient.module.css';

const EMPTY_FORM = { label: '', slug: '' };
type FormState = typeof EMPTY_FORM;

export default function CategoriesPageClient({ initialCategories }: { initialCategories: CategoryDTO[] }) {
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Mientras el admin no toque el slug a mano, se autogenera desde el nombre.
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openNewForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(category: CategoryDTO) {
    setEditingId(category.id);
    setForm({ label: category.label, slug: category.slug });
    setSlugTouched(true); // no reescribir el slug ya existente al editar el nombre
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  function handleLabelChange(value: string) {
    setForm((f) => ({
      label: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setForm((f) => ({ ...f, slug: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const result = editingId
      ? await updateCategoryAction({ id: editingId, label: form.label, slug: form.slug })
      : await createCategoryAction({ label: form.label, slug: form.slug });

    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setCategories((prev) => {
      if (editingId) return prev.map((c) => (c.id === result.data.id ? result.data : c));
      return [...prev, result.data].sort((a, b) => a.label.localeCompare(b.label));
    });
    closeForm();
  }

  async function handleDelete(category: CategoryDTO) {
    if (category.productCount > 0) return; // el botón ya está deshabilitado; esto es solo defensivo
    if (!window.confirm(`¿Eliminar la categoría "${category.label}"?`)) return;

    setListError(null);
    setDeletingId(category.id);
    const result = await deleteCategoryAction(category.id);
    setDeletingId(null);

    if (!result.ok) {
      setListError(result.error);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categorías</h1>
        {!isFormOpen && (
          <button type="button" className={styles.addButton} onClick={openNewForm}>
            + Nueva categoría
          </button>
        )}
      </div>

      {isFormOpen && (
        <form className={formStyles.form} onSubmit={handleSubmit}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Nombre</span>
            <input
              type="text"
              required
              autoFocus
              value={form.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className={formStyles.input}
            />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Slug</span>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={formStyles.input}
            />
            <span className={styles.hint}>
              URL: /category/{form.slug || '...'}
              {editingId && ' — cambiarlo puede romper enlaces externos ya compartidos.'}
            </span>
          </label>

          {formError && <p className={styles.error}>{formError}</p>}

          <div className={styles.formActions}>
            <button type="submit" className={formStyles.submit} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={closeForm}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {listError && <p className={styles.error}>{listError}</p>}

      {categories.length === 0 && !isFormOpen && (
        <p className={styles.empty}>Todavía no has creado ninguna categoría.</p>
      )}

      {categories.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Productos</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const canDelete = category.productCount === 0;
                return (
                  <tr key={category.id}>
                    <td>{category.label}</td>
                    <td className={styles.slugCell}>{category.slug}</td>
                    <td>{category.productCount}</td>
                    <td className={styles.actionsCell}>
                      <button type="button" onClick={() => openEditForm(category)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={!canDelete || deletingId === category.id}
                        title={
                          canDelete
                            ? undefined
                            : `No se puede borrar: hay ${category.productCount} producto(s) en esta categoría.`
                        }
                      >
                        {deletingId === category.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}