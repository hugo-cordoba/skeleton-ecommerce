import SectionRenderer from '@/components/sections/SectionRenderer';
import { landingSections } from '@/config/landing.config';
import { getFeaturedProducts, getProductsUnderPrice } from '@/data/products.config';

export default async function HomePage() {
  // Los "Productos destacados" y "Productos por menos de X" de la home
  // usan productos reales (no el mock de landing.config.ts) para que
  // favoritos y "anadir a la cesta" funcionen igual que en /products.
  const [featuredProducts, budgetProducts] = await Promise.all([
    getFeaturedProducts(4),
    getProductsUnderPrice(50, 8),
  ]);

  const sections = landingSections.map((section) => {
    if (section.type !== 'productCarousel') return section;
    const items = section.id === 'productos-baratos' ? budgetProducts : featuredProducts;
    return { ...section, props: { ...section.props, items } };
  });

  return <SectionRenderer sections={sections} />;
}