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

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
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
      body: JSON.stringify({ from, to, subject, html }),
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