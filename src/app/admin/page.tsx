import type { Metadata } from 'next';
import { getDashboardStats } from '@/lib/actions/admin/dashboard.actions';
import DashboardOverview from '@/components/admin/DashboardOverview/DashboardOverview';

export const metadata: Metadata = {
  title: 'Panel de administración',
};

export default async function AdminHomePage() {
  const stats = await getDashboardStats();
  return <DashboardOverview stats={stats} />;
}