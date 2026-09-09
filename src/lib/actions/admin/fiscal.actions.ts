'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin, runAdminAction, type AdminActionResult } from './admin-utils';

export interface FiscalConfigDTO {
  legalName: string;
  tradeName: string;
  nif: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  email: string;
  phone: string;
  invoiceFooterNote: string;
}

export async function getFiscalConfig(): Promise<FiscalConfigDTO | null> {
  await requireAdmin();
  const config = await prisma.fiscalConfig.findFirst();
  if (!config) return null;

  return {
    legalName: config.legalName,
    tradeName: config.tradeName ?? '',
    nif: config.nif,
    addressLine1: config.addressLine1,
    addressLine2: config.addressLine2 ?? '',
    postalCode: config.postalCode,
    city: config.city,
    province: config.province,
    country: config.country,
    email: config.email ?? '',
    phone: config.phone ?? '',
    invoiceFooterNote: config.invoiceFooterNote ?? '',
  };
}

export async function saveFiscalConfigAction(input: FiscalConfigDTO): Promise<AdminActionResult<void>> {
  return runAdminAction(async () => {
    if (!input.legalName.trim()) throw new Error('La razón social es obligatoria.');
    if (!input.nif.trim()) throw new Error('El NIF/CIF es obligatorio.');
    if (!input.addressLine1.trim() || !input.postalCode.trim() || !input.city.trim() || !input.province.trim()) {
      throw new Error('Completa la dirección fiscal completa.');
    }

    const existing = await prisma.fiscalConfig.findFirst();
    const data = {
      legalName: input.legalName.trim(),
      tradeName: input.tradeName.trim() || null,
      nif: input.nif.trim().toUpperCase(),
      addressLine1: input.addressLine1.trim(),
      addressLine2: input.addressLine2.trim() || null,
      postalCode: input.postalCode.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      country: input.country.trim() || 'España',
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      invoiceFooterNote: input.invoiceFooterNote.trim() || null,
    };

    if (existing) await prisma.fiscalConfig.update({ where: { id: existing.id }, data });
    else await prisma.fiscalConfig.create({ data });
  });
}