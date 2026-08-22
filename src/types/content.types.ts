/**
 * Tipos para las paginas de contenido estatico: about, legales
 * (privacidad/terminos/devoluciones/envios), faq y contacto.
 *
 * Igual que `section.types.ts` para la home, esto es lo que permite
 * que el contenido real viva en `config/content.config.ts` sin tocar
 * los componentes que lo pintan.
 */

export interface ContentSection {
  /** Encabezado de la seccion. Si se omite, el bloque no pinta su propio h2 (util para una intro suelta). */
  heading?: string;
  /** Parrafos del cuerpo; cada elemento del array se pinta como un <p> independiente. */
  body: string[];
  /** Lista de puntos opcional, se pinta despues de los parrafos. */
  list?: string[];
}

export interface ContentPageData {
  title: string;
  intro?: string;
  /** Fecha de la ultima revision; solo se usa en paginas legales (privacidad, terminos...). */
  updatedAt?: string;
  sections: ContentSection[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqPageData {
  title: string;
  intro?: string;
  items: FaqItem[];
}

export interface ContactInfoItem {
  label: string;
  value: string;
  /** ej. "mailto:hola@marca.com" o "tel:+34900000000". Si se omite, el valor se pinta como texto plano. */
  href?: string;
}

export interface ContactPageData {
  title: string;
  intro?: string;
  formTitle?: string;
  infoItems: ContactInfoItem[];
}
