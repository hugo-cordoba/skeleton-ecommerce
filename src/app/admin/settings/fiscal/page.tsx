import type { Metadata } from 'next';
import { getFiscalConfig } from '@/lib/actions/admin/fiscal.actions';
import FiscalSettingsClient from '@/components/admin/FiscalSettingsClient/FiscalSettingsClient';

export const metadata: Metadata = {
  title: 'Datos fiscales',
};

export default async function AdminFiscalSettingsPage() {
  const config = await getFiscalConfig();
  return <FiscalSettingsClient initialConfig={config} />;
}