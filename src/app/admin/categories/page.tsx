import type { Metadata } from 'next';
import { getCategories } from '@/lib/actions/admin/categories.actions';
import CategoriesPageClient from '@/components/admin/CategoriesPageClient/CategoriesPageClient';

export const metadata: Metadata = {
  title: 'Categorías',
};

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoriesPageClient initialCategories={categories} />;
}