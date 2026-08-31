'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { SavedAddress } from '@/types/address.types';

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

function toDTO(row: {
  id: string;
  label: string | null;
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}): SavedAddress {
  return {
    id: row.id,
    label: row.label ?? undefined,
    fullName: row.fullName,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2 ?? undefined,
    city: row.city,
    postalCode: row.postalCode,
    country: row.country,
    phone: row.phone ?? undefined,
    isDefault: row.isDefault,
  };
}

export async function getAddresses(): Promise<SavedAddress[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const rows = await prisma.savedAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });
  return rows.map(toDTO);
}

export async function addAddressAction(address: Omit<SavedAddress, 'id'>): Promise<SavedAddress[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  // La primera dirección, o cualquiera marcada explícitamente, pasa a
  // predeterminada. Mismo criterio que tenía el reducer local antes.
  const count = await prisma.savedAddress.count({ where: { userId } });
  const shouldBeDefault = address.isDefault || count === 0;

  await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    await tx.savedAddress.create({ data: { ...address, userId, isDefault: shouldBeDefault } });
  });

  return getAddresses();
}

export async function updateAddressAction(address: SavedAddress): Promise<SavedAddress[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const existing = await prisma.savedAddress.findUnique({ where: { id: address.id } });
  if (!existing || existing.userId !== userId) return getAddresses(); // no toca direcciones ajenas

  await prisma.$transaction(async (tx) => {
    if (address.isDefault) {
      await tx.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    // Campos explícitos (no spread): así un valor opcional vaciado en el
    // formulario (label: undefined) se guarda como null en vez de
    // "no tocar la columna", que es como interpreta Prisma un undefined
    // en un update.
    await tx.savedAddress.update({
      where: { id: address.id },
      data: {
        label: address.label ?? null,
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 ?? null,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone ?? null,
        isDefault: address.isDefault,
      },
    });
  });

  return getAddresses();
}

export async function removeAddressAction(id: string): Promise<SavedAddress[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const existing = await prisma.savedAddress.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return getAddresses();

  await prisma.$transaction(async (tx) => {
    await tx.savedAddress.delete({ where: { id } });

    // Si borrábamos la predeterminada, la primera que quede la hereda.
    if (existing.isDefault) {
      const remaining = await tx.savedAddress.findFirst({ where: { userId } });
      if (remaining) {
        await tx.savedAddress.update({ where: { id: remaining.id }, data: { isDefault: true } });
      }
    }
  });

  return getAddresses();
}

export async function setDefaultAddressAction(id: string): Promise<SavedAddress[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const existing = await prisma.savedAddress.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return getAddresses();

  await prisma.$transaction([
    prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.savedAddress.update({ where: { id }, data: { isDefault: true } }),
  ]);

  return getAddresses();
}