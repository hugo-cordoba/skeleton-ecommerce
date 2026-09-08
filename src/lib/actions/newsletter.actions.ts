'use server';

import { prisma } from '@/lib/prisma';

export interface NewsletterResult {
  ok: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Guarda el email en NewsletterSubscriber. Usa upsert a propósito: si
 * alguien se suscribe dos veces con el mismo email, no debe romper con un
 * error de restricción única -- simplemente confirma que ya está suscrito.
 */
export async function subscribeToNewsletterAction(email: string): Promise<NewsletterResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) return { ok: false, error: 'Introduce un email válido.' };

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail },
    });
    return { ok: true };
  } catch (error) {
    console.error('No se ha podido guardar la suscripción al newsletter:', error);
    return { ok: false, error: 'No se ha podido completar la suscripción. Inténtalo de nuevo.' };
  }
}