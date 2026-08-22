import type { Metadata } from 'next';
import ContentPage from '@/components/content/ContentPage/ContentPage';
import { returnsContent } from '@/config/content.config';

export const metadata: Metadata = {
  title: returnsContent.title,
};

export default function ReturnsPage() {
  return <ContentPage {...returnsContent} />;
}
