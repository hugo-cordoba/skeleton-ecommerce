'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

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