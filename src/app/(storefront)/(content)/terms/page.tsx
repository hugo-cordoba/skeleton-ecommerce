import type { Metadata } from 'next';
import ContentPage from '@/components/content/ContentPage/ContentPage';
import { termsContent } from '@/config/content.config';

export const metadata: Metadata = {
  title: termsContent.title,
};

export default function TermsPage() {
  return <ContentPage {...termsContent} />;
}
