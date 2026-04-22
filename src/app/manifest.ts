import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'La Celeste - Hamburguesas Artesanales',
    short_name: 'La Celeste',
    description: 'Sabores argentinos en Barquisimeto. ¡Pide ahora!',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdf8f0',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
