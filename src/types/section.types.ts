import type { Product } from './product.types';

export interface NavLink {
  label: string;
  href: string;
}

export interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  media: {
    type: 'image' | 'video';
    src: string;
    poster?: string;
  };
  ctaLabel?: string;
  ctaHref?: string;
  navLinks?: NavLink[];
}

export interface SplitIntroProps {
  eyebrow?: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: 'left' | 'right';
  ctaLabel?: string;
  ctaHref?: string;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  href?: string;
}

export interface PromoBanner {
  id: string;
  tag?: string;
  title: string;
  ctaLabel?: string;
  href: string;
  image?: string;
}

export interface ProductCarouselProps {
  title?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  items: FeaturedProduct[];
  promos: PromoBanner[];
}

export interface FeatureBannerProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  products?: Product[];
}

export interface Category {
  label: string;
  image: string;
  href?: string;
}

export interface CategoryGridProps {
  title?: string;
  categories: Category[];
}

/**
 * Union discriminada: cada seccion de la landing es un objeto con
 * "type" + "props" tipados. Esto es lo que permite que SectionRenderer
 * sepa que componente pintar y con que props, de forma 100% tipada.
 */
export type SectionConfig =
  | { id: string; type: 'hero'; props: HeroProps }
  | { id: string; type: 'splitIntro'; props: SplitIntroProps }
  | { id: string; type: 'productCarousel'; props: ProductCarouselProps }
  | { id: string; type: 'featureBanner'; props: FeatureBannerProps }
  | { id: string; type: 'categoryGrid'; props: CategoryGridProps };

export interface SocialLink {
  label: string;
  initial: string;
  href: string;
}
