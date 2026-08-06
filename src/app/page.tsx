import Header from '@/components/layout/Header/Header';
import SectionRenderer from '@/components/sections/SectionRenderer';
import Footer from '@/components/layout/Footer/Footer';
import { landingSections, siteNavLinks } from '@/config/landing.config';
import { siteConfig } from '@/config/site.config';

export default function HomePage() {
  return (
    <main>
      <Header siteName={siteConfig.name} navLinks={siteNavLinks} cartCount={0} />
      <SectionRenderer sections={landingSections} />
      <Footer siteName={siteConfig.name} />
    </main>
  );
}