// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET debe tener al menos 16 caracteres'),
  NEXTAUTH_URL: z.string().url(),
  CLIENT_SLUG: z.string().min(1),
  CLIENT_DOMAIN: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1, 'Falta STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Falta STRIPE_WEBHOOK_SECRET'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas o faltantes:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Configuración de entorno inválida. Revisa tu .env');
}

if (process.env.NODE_ENV === 'production' && (!parsed.data.RESEND_API_KEY || !parsed.data.EMAIL_FROM)) {
  console.warn('⚠️  RESEND_API_KEY o EMAIL_FROM no configuradas: el email de recuperación de contraseña no se enviará.');
}

export const env = parsed.data;
