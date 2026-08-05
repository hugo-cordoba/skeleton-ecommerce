/**
 * Configuracion GLOBAL de marca. Este es el fichero que cambia primero
 * al personalizar el esqueleto para un cliente nuevo (colores, nombre).
 * Los valores se inyectan como variables CSS en app/layout.tsx, asi que
 * cambiarlos aqui retematiza todo el sitio sin tocar ningun componente.
 */
export const siteConfig = {
  name: 'Tu Marca',
  description: 'Landing page base para tiendas online, personalizable por cliente.',
  colors: {
    primary: '#27272a',
    primaryLight: '#52525b',
    secondary: '#a1a1aa',
    background: '#f4f4f5',
    surface: '#ffffff',
    text: '#18181b',
    textMuted: '#71717a',
  },
} as const;