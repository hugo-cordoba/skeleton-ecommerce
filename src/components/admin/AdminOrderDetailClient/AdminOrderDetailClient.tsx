'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import type { AdminOrderDetail } from '@/lib/actions/admin/orders.actions';
import {
  refundOrderAction,
  resendOrderConfirmationEmailAction,
  updateOrderInternalNotesAction,
  updateOrderShippingAddressAction,
} from '@/lib/actions/admin/orders.actions';
import type { OrderStatus, ShippingAddress } from '@/types/order.types';
import { formatPrice } from '@/lib/currency';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect/OrderStatusSelect';
import formStyles from '@/components/checkout/checkoutForm.module.css';
import styles from './AdminOrderDetailClient.module.css';
import InvoiceSection from './InvoiceSection';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function toAddressForm(address: ShippingAddress) {
  return {
    fullName: address.fullName,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    city: address.city,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone ?? '',
  };
}

export default function AdminOrderDetailClient({ order: initialOrder }: { order: AdminOrderDetail }) {
  const [order, setOrder] = useState<AdminOrderDetail>(initialOrder);
  const [status, setStatus] = useState<OrderStatus>(initialOrder.status);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(toAddressForm(initialOrder.shippingAddress));
  const [addressError, setAddressError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [notes, setNotes] = useState(initialOrder.internalNotes ?? '');
  const [notesFeedback, setNotesFeedback] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const [refundError, setRefundError] = useState<string | null>(null);
  const [refunding, setRefunding] = useState(false);

  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const remainingToRefund = order.total - (order.refundedAmount ?? 0);
  const isCancelled = status === 'cancelled';

  async function handleSaveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressError(null);
    setSavingAddress(true);

    const result = await updateOrderShippingAddressAction(order.orderNumber, addressForm);
    setSavingAddress(false);

    if (!result.ok) {
      setAddressError(result.error);
      return;
    }

    setOrder((prev) => ({ ...prev, shippingAddress: result.data }));
    setIsEditingAddress(false);
  }

  function cancelEditAddress() {
    setAddressForm(toAddressForm(order.shippingAddress));
    setAddressError(null);
    setIsEditingAddress(false);
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    setNotesFeedback(null);

    const result = await updateOrderInternalNotesAction(order.orderNumber, notes);
    setSavingNotes(false);

    if (!result.ok) {
      setNotesFeedback(result.error);
      return;
    }

    setOrder((prev) => ({ ...prev, internalNotes: result.data.internalNotes }));
    setNotesFeedback('Notas guardadas.');
  }

  async function handleRefund(full: boolean) {
    let amount: number | undefined;
    if (!full) {
      const raw = window.prompt(
        `Importe a reembolsar en EUR (máx. ${remainingToRefund.toFixed(2)}):`,
        remainingToRefund.toFixed(2)
      );
      if (raw == null) return;
      amount = Number(raw);
      if (!Number.isFinite(amount)) return;
    }

    const confirmMessage = full
      ? '¿Cancelar este pedido y reembolsar el importe pendiente? Esta acción no se puede deshacer.'
      : `¿Reembolsar ${amount!.toFixed(2)} EUR de este pedido?`;
    if (!window.confirm(confirmMessage)) return;

    setRefundError(null);
    setRefunding(true);

    const result = await refundOrderAction(order.orderNumber, full ? {} : { amount });
    setRefunding(false);

    if (!result.ok) {
      setRefundError(result.error);
      return;
    }

    setStatus(result.data.status);
    setOrder((prev) => ({ ...prev, status: result.data.status, refundedAmount: result.data.refundedAmount }));
  }

  async function handleResendEmail() {
    setResendError(null);
    setResendFeedback(null);
    setResending(true);

    const result = await resendOrderConfirmationEmailAction(order.orderNumber);
    setResending(false);

    if (!result.ok) {
      setResendError(result.error);
      return;
    }

    setResendFeedback(`Email reenviado a ${order.email}.`);
  }

  return (
    <div className={styles.page}>
      <Link href="/admin/orders" className={styles.back}>
        ← Volver a pedidos
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedido {order.orderNumber}</h1>
          <p className={styles.subtitle}>
            {order.email}
            {order.isGuest && <span className={styles.guestBadge}>Invitado</span>}
            {' · '}
            {formatDate(order.createdAt)}
            {order.stripePaymentUrl && (
              <>
                {' · '}
                <a href={order.stripePaymentUrl} target="_blank" rel="noreferrer">
                  Ver en Stripe ↗
                </a>
              </>
            )}
          </p>
        </div>
        <OrderStatusSelect orderNumber={order.orderNumber} status={status} onChange={setStatus} />
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Envío</span>
          <span className={styles.cardValue}>{order.shippingMethod.label}</span>
          <span className={styles.cardSubvalue}>{order.shippingMethod.etaLabel}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Dirección</span>
          <span className={styles.cardValue}>
            {order.shippingAddress.addressLine1}, {order.shippingAddress.city}
          </span>
          <span className={styles.cardSubvalue}>
            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Contacto</span>
          <span className={styles.cardValue}>{order.shippingAddress.fullName}</span>
          <span className={styles.cardSubvalue}>{order.shippingAddress.phone ?? '—'}</span>
        </div>
      </div>

      <InvoiceSection orderNumber={order.orderNumber} />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Dirección de envío</h2>
          {!isEditingAddress && !isCancelled && (
            <button type="button" className={styles.linkButton} onClick={() => setIsEditingAddress(true)}>
              Editar
            </button>
          )}
        </div>

        {isEditingAddress ? (
          <form className={formStyles.form} onSubmit={handleSaveAddress}>
            <label className={formStyles.field}>
              <span className={formStyles.label}>Nombre completo</span>
              <input
                type="text"
                required
                value={addressForm.fullName}
                onChange={(e) => setAddressForm((f) => ({ ...f, fullName: e.target.value }))}
                className={formStyles.input}
              />
            </label>

            <label className={formStyles.field}>
              <span className={formStyles.label}>Dirección</span>
              <input
                type="text"
                required
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm((f) => ({ ...f, addressLine1: e.target.value }))}
                className={formStyles.input}
              />
            </label>

            <label className={formStyles.field}>
              <span className={formStyles.label}>Piso, puerta... (opcional)</span>
              <input
                type="text"
                value={addressForm.addressLine2}
                onChange={(e) => setAddressForm((f) => ({ ...f, addressLine2: e.target.value }))}
                className={formStyles.input}
              />
            </label>

            <div className={formStyles.row}>
              <label className={formStyles.field}>
                <span className={formStyles.label}>Ciudad</span>
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                  className={formStyles.input}
                />
              </label>

              <label className={formStyles.field}>
                <span className={formStyles.label}>Código postal</span>
                <input
                  type="text"
                  required
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
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
                  value={addressForm.country}
                  onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                  className={formStyles.input}
                />
              </label>

              <label className={formStyles.field}>
                <span className={formStyles.label}>Teléfono (opcional)</span>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                  className={formStyles.input}
                />
              </label>
            </div>

            {addressError && <p className={styles.error}>{addressError}</p>}

            <div className={styles.formActions}>
              <button type="submit" className={formStyles.submit} disabled={savingAddress}>
                {savingAddress ? 'Guardando...' : 'Guardar dirección'}
              </button>
              <button type="button" className={styles.linkButton} onClick={cancelEditAddress}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <p className={styles.addressText}>
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
            <br />
            {order.shippingAddress.postalCode} {order.shippingAddress.city}, {order.shippingAddress.country}
            {order.shippingAddress.phone && <> · {order.shippingAddress.phone}</>}
          </p>
        )}
      </section>

      <div className={styles.items}>
        {order.items.map((item) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.itemName}>
              {item.name} <span className={styles.itemQuantity}>× {item.quantity}</span>
            </span>
            <span className={styles.itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}

        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Envío</span>
          <span>{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
        </div>
        <div className={styles.total}>
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        {order.refundedAmount != null && order.refundedAmount > 0 && (
          <div className={styles.totalRow}>
            <span>Reembolsado</span>
            <span>{formatPrice(order.refundedAmount)}</span>
          </div>
        )}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Notas internas</h2>
        <p className={styles.hint}>Solo visibles para el equipo; el cliente nunca las ve.</p>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={styles.textarea}
          placeholder="Ej. cliente pidió cambiar la talla por teléfono, incidencia con el transportista..."
        />
        <div className={styles.formActions}>
          <button type="button" className={formStyles.submit} onClick={handleSaveNotes} disabled={savingNotes}>
            {savingNotes ? 'Guardando...' : 'Guardar notas'}
          </button>
          {notesFeedback && <span className={styles.hint}>{notesFeedback}</span>}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Acciones</h2>

        <div className={styles.actionsRow}>
          <button type="button" className={formStyles.submit} onClick={handleResendEmail} disabled={resending}>
            {resending ? 'Enviando...' : 'Reenviar email de confirmación'}
          </button>
          {resendFeedback && <span className={styles.hint}>{resendFeedback}</span>}
          {resendError && <span className={styles.error}>{resendError}</span>}
        </div>

        {!isCancelled && remainingToRefund > 0 && (
          <div className={styles.actionsRow}>
            <button type="button" className={styles.dangerButton} onClick={() => handleRefund(false)} disabled={refunding}>
              Reembolso parcial
            </button>
            <button type="button" className={styles.dangerButton} onClick={() => handleRefund(true)} disabled={refunding}>
              {refunding ? 'Procesando...' : 'Cancelar y reembolsar todo'}
            </button>
          </div>
        )}
        {refundError && <p className={styles.error}>{refundError}</p>}
        {isCancelled && (
          <p className={styles.hint}>
            Pedido cancelado y reembolsado ({formatPrice(order.refundedAmount ?? order.total)}).
          </p>
        )}
      </section>
    </div>
  );
}