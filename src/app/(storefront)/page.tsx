import SectionRenderer from '@/components/sections/SectionRenderer';
import { landingSections } from '@/config/landing.config';

// El Header y el Footer ya no viven aqui: los pone "(storefront)/layout.tsx".
export default function HomePage() {
  return <SectionRenderer sections={landingSections} />;
}
