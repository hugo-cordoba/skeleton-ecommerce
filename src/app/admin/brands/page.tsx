import type { Metadata } from 'next';
import { getBrands } from '@/lib/actions/admin/brands.actions';
import BrandsPageClient from '@/components/admin/BrandsPageClient/BrandsPageClient';

export const metadata: Metadata = {
  title: 'Marcas',
};

export default async function AdminBrandsPage() {
  const brands = await getBrands();
  return <BrandsPageClient initialBrands={brands} />;
}