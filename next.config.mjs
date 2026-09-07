/** @type {import('next').NextConfig} */

// El hostname público de R2 se resuelve en build-time (ver Dockerfile más
// abajo: se pasa como build-arg) para poder añadirlo a remotePatterns sin
// hardcodear el dominio de cada cliente en este fichero.
let r2Hostname = null;
try {
  r2Hostname = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null;
} catch {
  r2Hostname = null;
}

const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      ...(r2Hostname ? [{ protocol: 'https', hostname: r2Hostname }] : []),
    ],
  },
  experimental: {
    serverActions: {
      // Las imágenes de producto viajan como FormData en un Server Action;
      // el límite por defecto (1 MB) se queda corto.
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;