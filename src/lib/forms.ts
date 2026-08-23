/**
 * Envio de formularios (newsletter, contacto). Hoy simulado: resuelve
 * tras un pequeño delay, igual que el pago simulado del checkout.
 * Cuando haya backend, sustituye el cuerpo de estas funciones por un
 * fetch a tu API/proveedor (Resend, Formspree, endpoint propio...).
 */

export interface FormResult {
  ok: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function subscribeToNewsletter(email: string): Promise<FormResult> {
  if (!isValidEmail(email)) return { ok: false, error: 'Introduce un email válido.' };
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ok: true };
}

export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
}

export async function sendContactMessage(payload: ContactFormPayload): Promise<FormResult> {
  if (!isValidEmail(payload.email)) return { ok: false, error: 'Introduce un email válido.' };
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ok: true };
}