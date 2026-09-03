'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { randomBytes, createHash } from 'crypto';
import { sendEmail, passwordResetEmailHtml, passwordChangedEmailHtml } from '@/lib/email';

export async function registerUser(fullName: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return { ok: false, error: 'Ya existe una cuenta con ese email.' };

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { fullName, email: normalizedEmail, password: hashedPassword },
  });

  return { ok: true };
}

export async function updateProfileAction(
  userId: string,
  data: { fullName: string; email: string }
) {
  const normalizedEmail = data.email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { email: normalizedEmail, NOT: { id: userId } },
  });
  if (existing) return { ok: false, error: 'Ya existe una cuenta con ese email.' };

  await prisma.user.update({
    where: { id: userId },
    data: { fullName: data.fullName, email: normalizedEmail },
  });

  return { ok: true };
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const RESET_REQUEST_COOLDOWN_MS = 2 * 60 * 1000; // evita spam del email de un tercero

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Paso 1: genera un token de un solo uso y envía el email con el enlace.
 * Responde siempre {ok:true} exista o no la cuenta, para no filtrar qué
 * emails están registrados.
 */
export async function requestPasswordResetAction(email: string): Promise<{ ok: true }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user) {
    const lastToken = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    const recentlyRequested =
      lastToken && Date.now() - lastToken.createdAt.getTime() < RESET_REQUEST_COOLDOWN_MS;

    if (!recentlyRequested) {
      const rawToken = randomBytes(32).toString('hex');
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/account/reset-password/${rawToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Restablece tu contraseña',
        html: passwordResetEmailHtml(resetUrl),
      });
    }
  }

  return { ok: true };
}

/** Paso 2: valida el token sin consumirlo, para pintar "enlace no válido" antes de que el usuario escriba nada. */
export async function validateResetTokenAction(token: string): Promise<{ valid: boolean }> {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  return { valid: Boolean(record && !record.usedAt && record.expiresAt > new Date()) };
}

/** Paso 3: consume el token y actualiza la contraseña. */
export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 6) {
    return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: 'El enlace no es válido o ha caducado. Solicita uno nuevo.' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword, passwordChangedAt: new Date() },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Cualquier otro enlace pendiente para este usuario deja de servir.
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (user) {
    await sendEmail({ to: user.email, subject: 'Tu contraseña ha cambiado', html: passwordChangedEmailHtml() });
  }

  return { ok: true };
}