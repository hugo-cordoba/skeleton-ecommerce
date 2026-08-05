# Ecommerce Landing — Esqueleto base

Landing page modular construida con **Next.js 14 (App Router) + TypeScript + CSS Modules**, pensada para clonarse y personalizarse por cliente (ver flujo de trabajo con `git remote` que comentamos para el repo completo del ecommerce).

## Cómo arrancar

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Estructura

```
src/
├── app/
│   ├── layout.tsx        # fuentes + inyecta los colores de site.config.ts como variables CSS
│   ├── page.tsx           # arma la home: SectionRenderer + Footer
│   └── globals.css        # reset, tipografía base, accesibilidad (foco, reduced-motion)
│
├── config/
│   ├── site.config.ts     # 🎨 nombre de marca y paleta de colores → cambia esto primero
│   └── landing.config.ts  # 🧩 array de secciones de la home (contenido + orden)
│
├── types/
│   ├── section.types.ts   # props de cada sección + unión discriminada SectionConfig
│   └── product.types.ts   # tipo Product, compartido por varias secciones
│
├── components/
│   ├── sections/           # 1 carpeta por sección = 1 .tsx + 1 .module.css
│   │   ├── Hero/
│   │   ├── SplitIntro/
│   │   ├── ProductCarousel/
│   │   ├── FeatureBanner/
│   │   ├── CategoryGrid/
│   │   └── SectionRenderer.tsx   # 🔧 fichero común: decide qué componente pintar
│   ├── ui/                 # piezas reutilizables entre secciones
│   │   ├── Button/
│   │   └── ProductCard/
│   └── layout/
│       └── Footer/
```

## Cómo personalizar una tienda nueva (ej. una floristería)

1. **Marca**: edita `config/site.config.ts` → nombre y colores. Como los colores se inyectan como variables CSS globales (`--color-primary`, etc.), todo el sitio se retematiza sin tocar ni un componente.
2. **Contenido de la home**: edita `config/landing.config.ts` → cambia textos, imágenes y productos de cada sección.
3. **Imágenes reales**: sustituye las URLs de `placehold.co` (son solo placeholders) por tus imágenes finales, en `public/images/` o en tu CDN.

## Cómo añadir / quitar / reordenar secciones

- **Quitar una sección de esta página**: borra su objeto del array en `landing.config.ts`. No hay que tocar nada más.
- **Reordenar**: cambia el orden de los objetos en ese mismo array.
- **Crear una sección nueva** (ej. "Testimonios"):
  1. Crea `components/sections/Testimonials/Testimonials.tsx` + `Testimonials.module.css`.
  2. Añade su tipo de props en `types/section.types.ts` (nuevo miembro de la unión `SectionConfig`).
  3. Añade el `case 'testimonials': return <Testimonials ... />` en `SectionRenderer.tsx`.
  4. Ya puedes usarla desde `landing.config.ts`.

Este patrón (registro central + config declarativa) es el mismo que usarás para las páginas de producto, categoría, etc. cuando conectemos el backend.

## Componentes incluidos

| Componente | Uso |
|---|---|
| `Hero` | Cabecera a pantalla completa con imagen o vídeo de fondo, nav superpuesto, título y CTA |
| `SplitIntro` | Bloque de texto + imagen (posición izquierda/derecha configurable) |
| `ProductCarousel` | Carrusel horizontal de productos con controles, sin librerías externas (scroll-snap nativo) |
| `FeatureBanner` | Banner de ancho completo con color de marca, para campañas o colecciones destacadas |
| `CategoryGrid` | Grid de categorías con imagen y etiqueta |

## Notas técnicas

- Las imágenes usan `next/image`. Los dominios remotos permitidos están en `next.config.mjs` (`placehold.co` como demo — añade el tuyo cuando tengas CDN real).
- Tipografías: `Fraunces` (display/serif) + `Inter` (texto), cargadas vía `next/font/google` (sin flash de fuente, sin llamadas externas en runtime).
- `ProductCarousel` es el único componente cliente (`'use client'`), porque necesita `useRef` para los botones de scroll. El resto son Server Components.
