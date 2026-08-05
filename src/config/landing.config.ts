import type { SectionConfig } from '@/types/section.types';

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
        src: 'https://placehold.co/1600x900/3f4a3d/f0efe8?text=Video+o+imagen+de+fondo',
      },
      ctaLabel: 'Ver catalogo',
      ctaHref: '#productos',
      navLinks: [
        { label: 'Catalogo', href: '#productos' },
        { label: 'Nosotros', href: '#nosotros' },
        { label: 'Contacto', href: '#contacto' },
      ],
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
      image: 'https://placehold.co/900x1100/b8916a/1e1e1c?text=Imagen+de+marca',
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
      subtitle: 'Desliza para ver toda la coleccion',
      products: [
        { id: 'p1', name: 'Producto 1', price: '19,90 EUR', image: 'https://placehold.co/500x600/7c8d72/1e1e1c?text=Producto+1' },
        { id: 'p2', name: 'Producto 2', price: '24,90 EUR', image: 'https://placehold.co/500x600/b8916a/1e1e1c?text=Producto+2' },
        { id: 'p3', name: 'Producto 3', price: '15,90 EUR', image: 'https://placehold.co/500x600/3f4a3d/f0efe8?text=Producto+3' },
        { id: 'p4', name: 'Producto 4', price: '29,90 EUR', image: 'https://placehold.co/500x600/7c8d72/1e1e1c?text=Producto+4' },
        { id: 'p5', name: 'Producto 5', price: '12,90 EUR', image: 'https://placehold.co/500x600/b8916a/1e1e1c?text=Producto+5' },
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
        { label: 'Categoria 1', image: 'https://placehold.co/500x500/3f4a3d/f0efe8?text=Categoria+1' },
        { label: 'Categoria 2', image: 'https://placehold.co/500x500/7c8d72/1e1e1c?text=Categoria+2' },
        { label: 'Categoria 3', image: 'https://placehold.co/500x500/b8916a/1e1e1c?text=Categoria+3' },
        { label: 'Categoria 4', image: 'https://placehold.co/500x500/6b6b63/f0efe8?text=Categoria+4' },
      ],
    },
  },
];
