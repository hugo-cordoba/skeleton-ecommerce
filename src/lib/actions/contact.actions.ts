'use server';

import { sendEmail } from '@/lib/email';
import { contactContent } from '@/config/content.config';

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactActionResult {
  ok: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Envía el mensaje del formulario de contacto al email publicado en
 * content.config.ts (la misma dirección que se muestra en /contact), con
 * replyTo al email del cliente para poder responder directamente desde
 * el cliente de correo.
 */
export async function sendContactMessageAction(input: ContactMessageInput): Promise<ContactActionResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name || !message) return { ok: false, error: 'Completa todos los campos.' };
  if (!isValidEmail(email)) return { ok: false, error: 'Introduce un email válido.' };

  const contactEmailItem = contactContent.infoItems.find((item) => item.label === 'Email');
  const to = contactEmailItem?.value ?? process.env.EMAIL_FROM ?? 'no-reply@example.com';

  const result = await sendEmail({
    to,
    replyTo: email,
    subject: `Nuevo mensaje de contacto de ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      </div>
    `,
  });

  if (!result.ok) {
    return { ok: false, error: 'No se ha podido enviar el mensaje. Inténtalo de nuevo o escríbenos directamente.' };
  }
  return { ok: true };
}