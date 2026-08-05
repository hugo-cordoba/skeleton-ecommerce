import SectionRenderer from '@/components/sections/SectionRenderer';
import Footer from '@/components/layout/Footer/Footer';
import { landingSections } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';

export default function HomePage() {
  return (
    <main>
      <SectionRenderer sections={landingSections} />
      <Footer siteName={siteConfig.name} />
    </main>
  );
}
