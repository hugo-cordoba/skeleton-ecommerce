import type { Metadata } from 'next';
import ContentPage from '@/components/content/ContentPage/ContentPage';
import { aboutContent } from '@/config/content.config';

export const metadata: Metadata = {
  title: aboutContent.title,
};

export default function AboutPage() {
  return <ContentPage {...aboutContent} />;
}
