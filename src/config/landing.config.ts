import type { SectionConfig, NavLink, SocialLink } from '@/types/section.types';

/**
 * Enlaces de navegacion compartidos, usados por el Header fijo.
 * Antes vivian dentro de hero.props.navLinks; ahora estan aqui para
 * que el Header (fuera del Hero) pueda usarlos tambien.
 */
export const siteNavLinks: NavLink[] = [
  { label: 'Productos', href: '/products' },
  { label: 'Catalogo', href: '#productos' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
];

/**
 * Este es el fichero "comun" para AÑADIR, QUITAR o REORDENAR secciones
 * de la home. Es un simple array: el orden en que aparecen aqui es el
 * orden en que se pintan en la pagina.
 *
 * - Para quitar una seccion: borra (o comenta) su objeto del array.
 * - Para añadir una: copia un bloque, cambia "type" y sus "props".
 * - Para reordenar: cambia la posicion del objeto en el array.
 *
 * El contenido (texto, imagenes, productos) tambien vive aqui, para que
 * personalizar una tienda nueva sea, en gran parte, editar este fichero.
 */
export const landingSections: SectionConfig[] = [
  {
    id: 'hero',
    type: 'hero',
    props: {
      eyebrow: 'Nueva coleccion',
      title: 'Tu Marca',
      subtitle:
        'Descripcion breve y clara de la propuesta de valor. Sustituye este texto por el del cliente.',
      media: {
        type: 'image',
        src: 'https://placehold.co/1600x900/e4e4e7/a1a1aa?text=Video+o+imagen+de+fondo',
      },
      ctaLabel: 'Ver catalogo',
      ctaHref: '#productos',
    },
  },
  {
    id: 'nosotros',
    type: 'splitIntro',
    props: {
      eyebrow: 'Nuestra filosofia',
      title: 'Un texto que cuenta la historia de la marca',
      description:
        'Este bloque combina texto e imagen y sirve para presentar la marca, un producto destacado o un valor diferencial. Cambia imagen, texto y posicion segun el cliente.',
      image: 'https://placehold.co/900x1100/e4e4e7/a1a1aa?text=Imagen+de+marca',
      imagePosition: 'right',
      ctaLabel: 'Conoce mas',
      ctaHref: '#contacto',
    },
  },
  {
    id: 'productos',
    type: 'productCarousel',
    props: {
      title: 'Productos destacados',
      viewAllLabel: 'Ver todas',
      viewAllHref: '/products',
      items: [
        { id: 'p1', name: 'Producto 1', price: '19,90 EUR', image: 'https://placehold.co/300x300/e4e4e7/a1a1aa?text=1' },
        { id: 'p2', name: 'Producto 2', price: '24,90 EUR', image: 'https://placehold.co/300x300/e4e4e7/a1a1aa?text=2' },
        { id: 'p3', name: 'Producto 3', price: '15,90 EUR', image: 'https://placehold.co/300x300/e4e4e7/a1a1aa?text=3' },
        { id: 'p4', name: 'Producto 4', price: '29,90 EUR', image: 'https://placehold.co/300x300/e4e4e7/a1a1aa?text=4' },
        { id: 'p5', name: 'Producto 5', price: '12,90 EUR', image: 'https://placehold.co/300x300/e4e4e7/a1a1aa?text=5' },
      ],
      promos: [
        {
          id: 'promo1',
          tag: '25% de descuento',
          title: 'Frescura garantizada',
          ctaLabel: 'Comprar ahora',
          href: '#',
        },
        {
          id: 'promo2',
          tag: '25% de descuento',
          title: 'Calidad premium',
          ctaLabel: 'Comprar ahora',
          href: '#',
        },
      ],
    },
  },
  {
    id: 'destacado',
    type: 'featureBanner',
    props: {
      title: 'Una coleccion para cada ocasion',
      description: 'Bloque de ancho completo con el color principal de marca, ideal para campañas o lanzamientos.',
      ctaLabel: 'Comprar ahora',
      ctaHref: '#productos',
    },
  },
  {
    id: 'categorias',
    type: 'categoryGrid',
    props: {
      title: 'Explora por categoria',
      categories: [
          { label: 'Categoria 1', image: 'https://placehold.co/500x500/e4e4e7/a1a1aa?text=Categoria+1', href: '/category/categoria-1' },
          { label: 'Categoria 2', image: 'https://placehold.co/500x500/e4e4e7/a1a1aa?text=Categoria+2', href: '/category/categoria-2' },
          { label: 'Categoria 3', image: 'https://placehold.co/500x500/e4e4e7/a1a1aa?text=Categoria+3', href: '/category/categoria-3' },
          { label: 'Categoria 4', image: 'https://placehold.co/500x500/e4e4e7/a1a1aa?text=Categoria+4', href: '/category/categoria-4' },
        ],
    },
  },
];

export const footerContent = {
  slogan: 'Escribe aquí tu eslogan',
  socialLinks: [
    { label: 'Facebook', initial: 'F', href: '#' },
    { label: 'Twitter', initial: 'T', href: '#' },
    { label: 'LinkedIn', initial: 'L', href: '#' },
    { label: 'WhatsApp', initial: 'W', href: '#' },
    { label: 'Instagram', initial: 'I', href: '#' },
  ] as SocialLink[],
  aboutTitle: 'Sobre nosotros',
  aboutText:
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
  phone: '+0123 456 789 00',
  email: 'user@example.com',
  newsletterPlaceholder: 'Escribe tu email',
};
