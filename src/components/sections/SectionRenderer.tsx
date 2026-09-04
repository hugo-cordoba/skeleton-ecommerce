import Hero from './Hero/Hero';
import SplitIntro from './SplitIntro/SplitIntro';
import ProductCarousel from './ProductCarousel/ProductCarousel';
import FeatureBanner from './FeatureBanner/FeatureBanner';
import CategoryGrid from './CategoryGrid/CategoryGrid';
import PromoGrid from './PromoGrid/PromoGrid';
import type { SectionConfig } from '@/types/section.types';

export default function SectionRenderer({ sections }: { sections: SectionConfig[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case 'hero':
            return <Hero key={section.id} {...section.props} />;
          case 'splitIntro':
            return <SplitIntro key={section.id} {...section.props} />;
          case 'productCarousel':
            return <ProductCarousel key={section.id} {...section.props} />;
          case 'featureBanner':
            return <FeatureBanner key={section.id} {...section.props} />;
          case 'categoryGrid':
            return <CategoryGrid key={section.id} {...section.props} />;
          case 'promoGrid':
            return <PromoGrid key={section.id} {...section.props} />;
          default:
            return null;
        }
      })}
    </>
  );
}