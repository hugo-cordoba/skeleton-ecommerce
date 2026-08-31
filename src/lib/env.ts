// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET debe tener al menos 16 caracteres'),
  NEXTAUTH_URL: z.string().url(),
  CLIENT_SLUG: z.string().min(1),
  CLIENT_DOMAIN: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas o faltantes:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Configuración de entorno inválida. Revisa tu .env');
}

export const env = parsed.data;