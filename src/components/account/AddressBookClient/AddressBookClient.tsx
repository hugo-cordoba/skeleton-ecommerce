'use client';

import { useState, type FormEvent } from 'react';
import { useAddressBook } from '@/context/AddressBookContext';
import type { SavedAddress } from '@/types/address.types';
import formStyles from '@/components/checkout/checkoutForm.module.css';
import styles from './AddressBookClient.module.css';

const EMPTY_FORM = {
  label: '',
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'España',
  phone: '',
  isDefault: false,
};

type FormState = typeof EMPTY_FORM;

export default function AddressBookClient() {
  const { addresses, hydrated, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAddressBook();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Evita parpadear "vacio" antes de leer localStorage.
  if (!hydrated) return null;

  function openNewForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  }

  function openEditForm(address: SavedAddress) {
    setEditingId(address.id);
    setForm({
      label: address.label ?? '',
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? '',
      isDefault: address.isDefault,
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      label: form.label || undefined,
      fullName: form.fullName,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      phone: form.phone || undefined,
      isDefault: form.isDefault,
    };

    if (editingId) updateAddress({ ...payload, id: editingId });
    else addAddress(payload);

    closeForm();
  }

  function handleRemove(id: string) {
    if (window.confirm('¿Eliminar esta dirección?')) removeAddress(id);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis direcciones</h1>
        {!isFormOpen && (
          <button type="button" className={styles.addButton} onClick={openNewForm}>
            + Añadir dirección
          </button>
        )}
      </div>

      {isFormOpen && (
        <form className={formStyles.form} onSubmit={handleSubmit}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Etiqueta (opcional, ej. &quot;Casa&quot;)</span>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className={formStyles.input}
            />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Nombre completo</span>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className={formStyles.input}
            />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Dirección</span>
            <input
              type="text"
              required
              value={form.addressLine1}
              onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
              className={formStyles.input}
            />
          </label>

          <label className={formStyles.field}>
            <span className={formStyles.label}>Piso, puerta... (opcional)</span>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))}
              className={formStyles.input}
            />
          </label>

          <div className={formStyles.row}>
            <label className={formStyles.field}>
              <span className={formStyles.label}>Ciudad</span>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={formStyles.input}
              />
            </label>

            <label className={formStyles.field}>
              <span className={formStyles.label}>Código postal</span>
              <input
                type="text"
                required
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                className={formStyles.input}
              />
            </label>
          </div>

          <div className={formStyles.row}>
            <label className={formStyles.field}>
              <span className={formStyles.label}>País</span>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className={formStyles.input}
              />
            </label>

            <label className={formStyles.field}>
              <span className={formStyles.label}>Teléfono (opcional)</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={formStyles.input}
              />
            </label>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            <span>Usar como dirección predeterminada</span>
          </label>

          <div className={styles.formActions}>
            <button type="submit" className={formStyles.submit}>
              {editingId ? 'Guardar cambios' : 'Añadir dirección'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={closeForm}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !isFormOpen && (
        <p className={styles.empty}>Todavía no has guardado ninguna dirección.</p>
      )}

      {addresses.length > 0 && (
        <div className={styles.list}>
          {addresses.map((address) => (
            <div key={address.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{address.label || 'Dirección'}</span>
                {address.isDefault && <span className={styles.defaultBadge}>Predeterminada</span>}
              </div>

              <p className={styles.cardText}>{address.fullName}</p>
              <p className={styles.cardText}>
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ''}
              </p>
              <p className={styles.cardText}>
                {address.postalCode} {address.city}, {address.country}
              </p>
              {address.phone && <p className={styles.cardText}>{address.phone}</p>}

              <div className={styles.cardActions}>
                <button type="button" onClick={() => openEditForm(address)}>
                  Editar
                </button>
                {!address.isDefault && (
                  <button type="button" onClick={() => setDefaultAddress(address.id)}>
                    Marcar como predeterminada
                  </button>
                )}
                <button type="button" onClick={() => handleRemove(address.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}