import SectionRenderer from '@/components/sections/SectionRenderer';
import { landingSections } from '@/config/landing.config';
import { getFeaturedProducts } from '@/data/products.config';

export default async function HomePage() {
  // Los "Productos destacados" de la home usan productos reales (no el
  // mock de landing.config.ts) para que favoritos y "anadir a la cesta"
  // funcionen igual que en /products.
  const featuredProducts = await getFeaturedProducts(5);

  const sections = landingSections.map((section) =>
    section.type === 'productCarousel'
      ? { ...section, props: { ...section.props, items: featuredProducts } }
      : section
  );

  return <SectionRenderer sections={sections} />;
}