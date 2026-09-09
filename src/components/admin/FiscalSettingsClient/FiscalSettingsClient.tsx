'use client';

import { useState, type FormEvent } from 'react';
import { saveFiscalConfigAction, type FiscalConfigDTO } from '@/lib/actions/admin/fiscal.actions';
import formStyles from '@/components/checkout/checkoutForm.module.css';

const EMPTY: FiscalConfigDTO = {
  legalName: '',
  tradeName: '',
  nif: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  province: '',
  country: 'España',
  email: '',
  phone: '',
  invoiceFooterNote: '',
};

export default function FiscalSettingsClient({ initialConfig }: { initialConfig: FiscalConfigDTO | null }) {
  const [form, setForm] = useState<FiscalConfigDTO>(initialConfig ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set<K extends keyof FiscalConfigDTO>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);
    setIsSubmitting(true);

    const result = await saveFiscalConfigAction(form);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFeedback('Datos guardados. Se usarán como emisor en todas las facturas emitidas a partir de ahora.');
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <h1 className={formStyles.title}>Datos fiscales del vendedor</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
        Revísalos con tu gestor antes de la primera venta real: son los que aparecerán como emisor en cada factura.
      </p>

      <div className={formStyles.section}>
        <label className={formStyles.field}>
          <span className={formStyles.label}>Razón social</span>
          <input required value={form.legalName} onChange={(e) => set('legalName', e.target.value)} className={formStyles.input} />
        </label>
        <label className={formStyles.field}>
          <span className={formStyles.label}>Nombre comercial (opcional)</span>
          <input value={form.tradeName} onChange={(e) => set('tradeName', e.target.value)} className={formStyles.input} />
        </label>
        <label className={formStyles.field}>
          <span className={formStyles.label}>NIF/CIF</span>
          <input required value={form.nif} onChange={(e) => set('nif', e.target.value)} className={formStyles.input} />
        </label>
      </div>

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Domicilio fiscal</h2>
        <label className={formStyles.field}>
          <span className={formStyles.label}>Dirección</span>
          <input required value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} className={formStyles.input} />
        </label>
        <label className={formStyles.field}>
          <span className={formStyles.label}>Piso, puerta... (opcional)</span>
          <input value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} className={formStyles.input} />
        </label>
        <div className={formStyles.row}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Código postal</span>
            <input required value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} className={formStyles.input} />
          </label>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Ciudad</span>
            <input required value={form.city} onChange={(e) => set('city', e.target.value)} className={formStyles.input} />
          </label>
        </div>
        <div className={formStyles.row}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Provincia</span>
            <input required value={form.province} onChange={(e) => set('province', e.target.value)} className={formStyles.input} />
          </label>
          <label className={formStyles.field}>
            <span className={formStyles.label}>País</span>
            <input required value={form.country} onChange={(e) => set('country', e.target.value)} className={formStyles.input} />
          </label>
        </div>
      </div>

      <div className={formStyles.section}>
        <h2 className={formStyles.sectionTitle}>Contacto y notas (opcional)</h2>
        <div className={formStyles.row}>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Email</span>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={formStyles.input} />
          </label>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Teléfono</span>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={formStyles.input} />
          </label>
        </div>
        <label className={formStyles.field}>
          <span className={formStyles.label}>Nota al pie de la factura (ej. registro mercantil)</span>
          <input value={form.invoiceFooterNote} onChange={(e) => set('invoiceFooterNote', e.target.value)} className={formStyles.input} />
        </label>
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: '0.85rem' }}>{error}</p>}
      {feedback && <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>{feedback}</p>}

      <button type="submit" className={formStyles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar datos fiscales'}
      </button>
    </form>
  );
}