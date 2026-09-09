'use client';

import { useEffect, useState } from 'react';
import {
  generateInvoiceForOrderAdminAction,
  getInvoicesForOrder,
  resendInvoiceEmailAdminAction,
  type InvoiceSummaryDTO,
} from '@/lib/actions/admin/invoices.actions';
import styles from './AdminOrderDetailClient.module.css';

const TYPE_LABELS: Record<string, string> = {
  SIMPLIFIED: 'Simplificada',
  FULL: 'Completa',
  RECTIFICATIVE: 'Rectificativa',
};

export default function InvoiceSection({ orderNumber }: { orderNumber: string }) {
  const [invoices, setInvoices] = useState<InvoiceSummaryDTO[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInvoicesForOrder(orderNumber).then(setInvoices);
  }, [orderNumber]);

  async function handleGenerate() {
    setError(null);
    let buyerNif: string | undefined;
    let buyerLegalName: string | undefined;

    if (window.confirm('¿Necesita factura completa con NIF/CIF del comprador? Aceptar = sí, Cancelar = factura simplificada.')) {
      buyerNif = window.prompt('NIF/CIF del comprador:') ?? undefined;
      buyerLegalName = window.prompt('Nombre o razón social del comprador:') ?? undefined;
    }

    setGenerating(true);
    const result = await generateInvoiceForOrderAdminAction(orderNumber, buyerNif, buyerLegalName);
    setGenerating(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInvoices((prev) => [...(prev ?? []), result.data]);
  }

  async function handleResend(invoiceId: string, invoiceNumber: string) {
    setError(null);
    setResendingId(invoiceId);
    const result = await resendInvoiceEmailAdminAction(invoiceNumber);
    setResendingId(null);
    if (!result.ok) setError(result.error);
  }

  if (invoices === null) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Facturas</h2>
        {invoices.length === 0 && (
          <button type="button" className={styles.linkButton} onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generando...' : 'Generar factura'}
          </button>
        )}
      </div>

      {invoices.length === 0 ? (
        <p className={styles.hint}>Todavía no se ha emitido ninguna factura para este pedido.</p>
      ) : (
        invoices.map((invoice) => (
          <p key={invoice.id} className={styles.addressText}>
            <a href={`/api/invoices/${invoice.invoiceNumber}`} target="_blank" rel="noreferrer">
              {invoice.invoiceNumber}
            </a>{' '}
            · {TYPE_LABELS[invoice.type] ?? invoice.type}
            {invoice.status === 'RECTIFIED' && ' · rectificada'}
            {' · '}
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => handleResend(invoice.id, invoice.invoiceNumber)}
              disabled={resendingId === invoice.id}
            >
              {resendingId === invoice.id ? 'Enviando...' : 'Reenviar por email'}
            </button>
          </p>
        ))
      )}

      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
}