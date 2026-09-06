'use client';

import { useTransition, type ChangeEvent } from 'react';
import type { OrderStatus } from '@/types/order.types';
import { updateOrderStatusAction } from '@/lib/actions/admin/orders.actions';
import styles from './OrderStatusSelect.module.css';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'processing', label: 'En preparación' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
];

interface OrderStatusSelectProps {
  orderNumber: string;
  status: OrderStatus;
  onChange: (status: OrderStatus) => void;
}

export default function OrderStatusSelect({ orderNumber, status, onChange }: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as OrderStatus;
    const previous = status;
    onChange(next); // optimista

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderNumber, next);
      if (!result.ok) onChange(previous); // revertimos si falla
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className={styles.select}
      data-status={status}
      aria-label={`Estado del pedido ${orderNumber}`}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}