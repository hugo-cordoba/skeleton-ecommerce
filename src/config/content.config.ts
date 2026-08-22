import type { ContactPageData, ContentPageData, FaqPageData } from '@/types/content.types';

/**
 * Contenido de las paginas estaticas (about, legales, faq, contacto).
 * Igual que `landing.config.ts` para la home, este es el fichero a
 * editar para personalizar los textos de una tienda nueva: cambia
 * titulos, parrafos y datos de contacto sin tocar los componentes.
 *
 * Los textos son PLACEHOLDER: sustituyelos por el contenido real del
 * cliente (historia de marca, politicas reales, FAQ reales...).
 */

export const aboutContent: ContentPageData = {
  title: 'Sobre nosotros',
  intro:
    'Contamos aqui quienes somos, que nos mueve y por que existe esta marca. Sustituye este texto por la historia real del cliente.',
  sections: [
    {
      heading: 'Nuestra historia',
      body: [
        'Texto de ejemplo sobre como nacio la marca: el problema que queria resolver, el momento en el que empezo y los primeros pasos.',
        'Puedes anadir uno o varios parrafos por seccion; cada elemento del array "body" se pinta como un parrafo independiente.',
      ],
    },
    {
      heading: 'Lo que nos importa',
      body: ['Describe aqui los valores o compromisos de la marca (calidad, sostenibilidad, origen de los materiales, etc.).'],
      list: ['Ejemplo de valor o compromiso 1', 'Ejemplo de valor o compromiso 2', 'Ejemplo de valor o compromiso 3'],
    },
    {
      heading: 'El equipo',
      body: ['Un par de lineas sobre quien esta detras de la marca, o sobre el equipo si aplica.'],
    },
  ],
};

export const privacyContent: ContentPageData = {
  title: 'Politica de privacidad',
  updatedAt: 'Sustituir por la fecha real (ej. 1 de enero de 2026)',
  sections: [
    {
      heading: '1. Que datos recopilamos',
      body: [
        'Texto placeholder: detalla que datos personales se recogen (nombre, email, direccion de envio, historial de pedidos...) y con que finalidad.',
      ],
    },
    {
      heading: '2. Como usamos tus datos',
      body: ['Texto placeholder: explica para que se usan los datos (gestionar pedidos, enviar comunicaciones, mejorar el servicio...).'],
    },
    {
      heading: '3. Con quien los compartimos',
      body: ['Texto placeholder: menciona proveedores externos (pasarela de pago, transportista, email marketing) si los hay.'],
    },
    {
      heading: '4. Tus derechos',
      body: [
        'Texto placeholder: explica como el usuario puede acceder, rectificar o eliminar sus datos, y a que email debe escribir para ejercerlo.',
      ],
    },
  ],
};

export const termsContent: ContentPageData = {
  title: 'Terminos y condiciones',
  updatedAt: 'Sustituir por la fecha real (ej. 1 de enero de 2026)',
  sections: [
    {
      heading: '1. Aceptacion de los terminos',
      body: ['Texto placeholder: al usar esta web, el usuario acepta estos terminos y condiciones.'],
    },
    {
      heading: '2. Pedidos y precios',
      body: ['Texto placeholder: como se confirman los pedidos, cuando se cobra, disponibilidad de stock, cambios de precio.'],
    },
    {
      heading: '3. Propiedad intelectual',
      body: ['Texto placeholder: los contenidos de la web (textos, imagenes, logo) son propiedad de la marca salvo que se indique lo contrario.'],
    },
    {
      heading: '4. Limitacion de responsabilidad',
      body: ['Texto placeholder: casos en los que la marca no se hace responsable (uso indebido del producto, causas de fuerza mayor...).'],
    },
  ],
};

export const returnsContent: ContentPageData = {
  title: 'Devoluciones y cambios',
  intro: 'Resumen del proceso de devolucion. Sustituye los plazos y condiciones por los reales del cliente.',
  sections: [
    {
      heading: 'Plazo para devolver',
      body: ['Ejemplo: dispones de 30 dias naturales desde la recepcion del pedido para solicitar una devolucion.'],
    },
    {
      heading: 'Condiciones del producto',
      body: ['Ejemplo: el producto debe estar sin usar, con su embalaje original y las etiquetas puestas.'],
      list: ['Sin usar ni lavar', 'Embalaje original', 'Etiquetas puestas', 'Con el ticket o numero de pedido'],
    },
    {
      heading: 'Como iniciar una devolucion',
      body: ['Ejemplo: escribe a [email de contacto] indicando tu numero de pedido y el motivo de la devolucion.'],
    },
    {
      heading: 'Reembolsos',
      body: ['Ejemplo: una vez recibido y revisado el producto, el reembolso se realiza en un plazo de X dias habiles al metodo de pago original.'],
    },
  ],
};

export const shippingPolicyContent: ContentPageData = {
  title: 'Envios',
  intro: 'Resumen de plazos, zonas y costes de envio. Sustituye por los datos reales del cliente.',
  sections: [
    {
      heading: 'Plazos de entrega',
      body: ['Ejemplo: los pedidos se entregan en un plazo de 3 a 5 dias laborables desde la confirmacion del pago.'],
    },
    {
      heading: 'Zonas de envio',
      body: ['Ejemplo: enviamos actualmente a Peninsula y Baleares. Consulta disponibilidad para Canarias, Ceuta y Melilla.'],
    },
    {
      heading: 'Costes de envio',
      body: ['Ejemplo: envio gratuito a partir de X EUR de compra; por debajo de ese importe, el coste es de Y EUR.'],
    },
    {
      heading: 'Seguimiento del pedido',
      body: ['Ejemplo: recibiras un email con el numero de seguimiento en cuanto el pedido salga del almacen.'],
    },
  ],
};

export const faqContent: FaqPageData = {
  title: 'Preguntas frecuentes',
  intro: 'Resuelve aqui las dudas mas habituales. Sustituye las preguntas por las reales de tu tienda.',
  items: [
    {
      question: 'Cuanto tarda en llegar mi pedido?',
      answer: 'Ejemplo: los pedidos se entregan en 3-5 dias laborables. Consulta la pagina de Envios para mas detalle.',
    },
    {
      question: 'Puedo devolver un producto?',
      answer: 'Ejemplo: si, dispones de 30 dias desde la recepcion. Consulta la pagina de Devoluciones para el proceso completo.',
    },
    {
      question: 'Que metodos de pago aceptais?',
      answer: 'Ejemplo: tarjeta de credito/debito y otros metodos que ofrezca el cliente.',
    },
    {
      question: 'Como puedo contactar con vosotros?',
      answer: 'Ejemplo: puedes escribirnos desde la pagina de Contacto o directamente al email de contacto.',
    },
    {
      question: 'Haceis envios internacionales?',
      answer: 'Ejemplo: actualmente enviamos solo a una zona concreta. Estamos trabajando en ampliar la cobertura.',
    },
  ],
};

export const contactContent: ContactPageData = {
  title: 'Contacto',
  intro: 'Tienes alguna duda? Escribenos y te responderemos lo antes posible.',
  formTitle: 'Escribenos',
  infoItems: [
    { label: 'Email', value: 'hola@tumarca.com', href: 'mailto:hola@tumarca.com' },
    { label: 'Telefono', value: '+34 900 000 000', href: 'tel:+34900000000' },
    { label: 'Horario', value: 'Lunes a viernes, 9:00-18:00' },
  ],
};
