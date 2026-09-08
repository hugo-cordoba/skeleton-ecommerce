/**
 * Envio de emails transaccionales (recuperacion de contraseña, y en el
 * futuro confirmacion de pedido, etc.). Usa la API HTTP de Resend
 * directamente, sin SDK, para no añadir una dependencia nueva.
 *
 * Variables de entorno:
 *   RESEND_API_KEY -> clave de https://resend.com
 *   EMAIL_FROM     -> remitente verificado, ej. "Tu Marca <no-reply@tumarca.com>"
 *
 * Si no hay RESEND_API_KEY (tipico en local), el email se imprime por
 * consola en vez de enviarse, para no romper el flujo en desarrollo.
 */
import { formatPrice } from '@/lib/currency';
import type { Order } from '@/types/order.types';

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'no-reply@example.com';

  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY no configurada; simulando envío.');
    console.info(`[email] Para: ${to} | Asunto: ${subject}\n${html}`);
    return { ok: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });

    if (!response.ok) {
      console.error('[email] Error al enviar:', response.status, await response.text());
      return { ok: false, error: 'No se ha podido enviar el email.' };
    }
    return { ok: true };
  } catch (error) {
    console.error('[email] Error de red al enviar:', error);
    return { ok: false, error: 'No se ha podido enviar el email.' };
  }
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Restablece tu contraseña</h2>
      <p>Hemos recibido una solicitud para restablecer tu contraseña. Este enlace caduca en 1 hora.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;border-radius:999px;text-decoration:none;">
          Restablecer contraseña
        </a>
      </p>
      <p>Si no has solicitado esto, puedes ignorar este email; tu contraseña no cambiará.</p>
    </div>
  `;
}

export function passwordChangedEmailHtml(): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Tu contraseña ha cambiado</h2>
      <p>Confirmamos que la contraseña de tu cuenta se ha actualizado correctamente.</p>
      <p>Si no has sido tú, contacta con nosotros de inmediato respondiendo a este email.</p>
    </div>
  `;
}

export function orderConfirmationEmailHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;">${item.name} × ${item.quantity}</td>
          <td style="padding:8px 0; text-align:right;">${formatPrice(item.unitPrice * item.quantity)}</td>
        </tr>`
    )
    .join('');

  const { shippingAddress, shippingMethod } = order;

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Confirmación de tu pedido ${order.orderNumber}</h2>
      <p>Hola ${shippingAddress.fullName}, aquí tienes el resumen de tu pedido.</p>
      <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
        ${itemsHtml}
      </table>
      <p><strong>Total: ${formatPrice(order.total)}</strong></p>
      <p>Envío: ${shippingMethod.label} (${shippingMethod.etaLabel})</p>
      <p>
        Dirección de envío:<br/>
        ${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ''}<br/>
        ${shippingAddress.postalCode} ${shippingAddress.city}, ${shippingAddress.country}
      </p>
      <p>Gracias por tu compra.</p>
    </div>
  `;
}

export function orderStatusUpdateEmailHtml(order: Order, status: 'shipped' | 'delivered'): string {
  const statusLabel = status === 'shipped' ? 'enviado' : 'entregado';
  const title = status === 'shipped' ? 'Tu pedido ha sido enviado' : 'Tu pedido ha sido entregado';

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${title}</h2>
      <p>Hola, tu pedido <strong>${order.orderNumber}</strong> ha sido marcado como <strong>${statusLabel}</strong>.</p>
      <p>
        Dirección de envío:<br/>
        ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br/>
        ${order.shippingAddress.postalCode} ${order.shippingAddress.city}, ${order.shippingAddress.country}
      </p>
      <p>Gracias por tu compra.</p>
    </div>
  `;
}

export function orderRefundEmailHtml(order: Order, refundedAmount: number, isFullRefund: boolean): string {
  const title = isFullRefund
    ? 'Tu pedido ha sido cancelado y reembolsado'
    : 'Hemos procesado un reembolso parcial de tu pedido';

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${title}</h2>
      <p>Hola, en relación con tu pedido <strong>${order.orderNumber}</strong>:</p>
      <p><strong>Importe reembolsado: ${formatPrice(refundedAmount)}</strong></p>
      ${isFullRefund ? '<p>El pedido ha quedado cancelado.</p>' : '<p>El resto del pedido sigue su curso habitual.</p>'}
      <p>El reembolso puede tardar unos días en reflejarse en tu método de pago original.</p>
    </div>
  `;
}

