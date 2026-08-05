import Hero from './Hero/Hero';
import SplitIntro from './SplitIntro/SplitIntro';
import ProductCarousel from './ProductCarousel/ProductCarousel';
import FeatureBanner from './FeatureBanner/FeatureBanner';
import CategoryGrid from './CategoryGrid/CategoryGrid';
import type { SectionConfig } from '@/types/section.types';

/**
 * FICHERO COMUN: aqui se decide que componente se pinta para cada
 * "type" definido en config/landing.config.ts.
 *
 * Para AÑADIR una seccion nueva a todo el sistema (no solo a esta home):
 *  1. Crea el componente en components/sections/NombreSeccion/
 *  2. Añade su tipo (props) en types/section.types.ts
 *  3. Añade el "case" correspondiente aqui abajo
 *  4. Ya puedes usarla desde config/landing.config.ts
 *
 * Para QUITAR o REORDENAR secciones de una pagina concreta: no toques
 * este fichero, edita el array en config/landing.config.ts.
 */
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
          default:
            return null;
        }
      })}
    </>
  );
}
