import type { Metadata } from 'next';
import ContentPage from '@/components/content/ContentPage/ContentPage';
import { privacyContent } from '@/config/content.config';

export const metadata: Metadata = {
  title: privacyContent.title,
};

export default function PrivacyPage() {
  return <ContentPage {...privacyContent} />;
}
