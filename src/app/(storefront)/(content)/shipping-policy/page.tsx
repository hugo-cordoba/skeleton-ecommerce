import type { Metadata } from 'next';
import ContentPage from '@/components/content/ContentPage/ContentPage';
import { shippingPolicyContent } from '@/config/content.config';

export const metadata: Metadata = {
  title: shippingPolicyContent.title,
};

export default function ShippingPolicyPage() {
  return <ContentPage {...shippingPolicyContent} />;
}
