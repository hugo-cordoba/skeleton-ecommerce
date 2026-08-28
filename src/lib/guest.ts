import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const GUEST_COOKIE = 'guest_id';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

/**
 * Devuelve el guestId existente, o crea uno nuevo y lo guarda en cookie.
 * Solo se puede llamar desde Server Actions o Route Handlers (donde se
 * puede escribir la cookie).
 */
export function getOrCreateGuestId(): string {
  const store = cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  if (existing) return existing;

  const guestId = randomUUID();
  store.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: GUEST_COOKIE_MAX_AGE,
    path: '/',
  });
  return guestId;
}

/** Solo lee la cookie, no la crea. */
export function readGuestId(): string | undefined {
  return cookies().get(GUEST_COOKIE)?.value;
}

export function clearGuestId(): void {
  cookies().delete(GUEST_COOKIE);
}