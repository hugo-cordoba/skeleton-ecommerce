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
    primary: '#3f4a3d',
    primaryLight: '#7c8d72',
    secondary: '#b8916a',
    background: '#f0efe8',
    surface: '#ffffff',
    text: '#1e1e1c',
    textMuted: '#6b6b63',
  },
} as const;
