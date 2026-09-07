import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { env } from '@/lib/env';

/**
 * R2 es compatible con la API S3, así que reutilizamos el SDK de AWS en vez
 * de un cliente propio. "auto" como región es lo que espera R2 (no usa
 * regiones reales de AWS). Cliente cacheado a nivel de módulo, igual que
 * el patrón de prisma.ts, para no crearlo en cada subida.
 */
let cachedClient: S3Client | null = null;

function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 no está configurado. Revisa R2_ACCOUNT_ID, R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY.');
  }

  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  return cachedClient;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export interface UploadImageResult {
  url: string;
  key: string;
}

/**
 * Sube un fichero de imagen a R2 bajo un prefijo (ej. "products") y
 * devuelve su URL pública. El nombre original del archivo se descarta:
 * se genera un key aleatorio para evitar colisiones y no depender de lo
 * que mande el navegador.
 */
export async function uploadImageToR2(file: File, prefix: string): Promise<UploadImageResult> {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error('Formato no soportado. Usa JPG, PNG, WEBP o AVIF.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('La imagen supera el tamaño máximo permitido (5 MB).');
  }
  if (!env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) {
    throw new Error('R2 no está configurado. Revisa R2_BUCKET_NAME y R2_PUBLIC_URL.');
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  const key = `${prefix}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // Los keys son aleatorios e inmutables (un reemplazo sube un key
      // nuevo en vez de sobrescribir), así que se puede cachear "para siempre".
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return { url: `${env.R2_PUBLIC_URL}/${key}`, key };
}

/**
 * Borra un objeto de R2 a partir de su URL pública. Si la URL no pertenece
 * a este bucket de R2 (ej. una imagen antigua de placehold.co del seed) no
 * hace nada, en vez de lanzar.
 */
export async function deleteImageFromR2(url: string): Promise<void> {
  if (!env.R2_PUBLIC_URL || !env.R2_BUCKET_NAME || !url.startsWith(env.R2_PUBLIC_URL)) return;

  const key = url.slice(env.R2_PUBLIC_URL.length + 1); // quita "R2_PUBLIC_URL/"
  await getR2Client().send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
}