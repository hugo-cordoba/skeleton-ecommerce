import { headers } from 'next/headers';

interface RateLimitConfig {
  /** Máximo de intentos permitidos dentro de la ventana. */
  limit: number;
  /** Duración de la ventana en milisegundos. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Limitador en memoria, por proceso. Pensado para el despliegue actual:
 * un único contenedor `web` por cliente (ver docker-compose.yml), sin
 * réplicas. Si en el futuro se escala horizontalmente, esto deja de ser
 * fiable (cada réplica cuenta aparte) y hay que pasar a un backend
 * compartido (Redis, o una tabla de Postgres con upsert atómico).
 */
const buckets = new Map<string, Bucket>();

// Barrido periódico para no acumular memoria indefinidamente en un
// proceso de larga duración; se dispara de paso, en cada llamada.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Lee la IP real del cliente detrás de Traefik. */
export function getClientIp(): string {
  const headerList = headers();
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headerList.get('x-real-ip') ?? 'unknown';
}

export function checkRateLimit(action: string, identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const key = `${action}:${identifier}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (bucket.count >= config.limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Azúcar para el caso más común: limitar por IP del solicitante. */
export function checkRateLimitByIp(action: string, config: RateLimitConfig): RateLimitResult {
  return checkRateLimit(action, getClientIp(), config);
}