import type { Metadata } from 'next';
import ContentPage from '@/components/content/ContentPage/ContentPage';
import { cookiesContent } from '@/config/content.config';

export const metadata: Metadata = {
  title: cookiesContent.title,
};

export default function CookiesPage() {
  return <ContentPage {...cookiesContent} />;
}