import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AppInit } from '@/components/layout/AppInit';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://laceleste.app'), // Placeholder, user can update
  title: {
    default: 'La Celeste - Hamburguesas Artesanales | Barquisimeto',
    template: '%s | La Celeste',
  },
  description: 'Las mejores hamburguesas artesanales de Barquisimeto. Inspiradas en los sabores de Argentina. Carne 100% de solomo, pan de papa y tequeños crujientes.',
  keywords: ['hamburguesas', 'barquisimeto', 'la celeste', 'comida rapida', 'delivery', 'artesanal', 'venezuela'],
  authors: [{ name: 'La Celeste' }],
  creator: 'La Celeste',
  publisher: 'La Celeste',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: 'La Celeste - Hamburguesas Artesanales',
    description: 'Sabores argentinos en Barquisimeto. ¡Pide ahora!',
    url: 'https://laceleste.app',
    siteName: 'La Celeste',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'La Celeste Burgers',
      },
    ],
    locale: 'es_VE',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'La Celeste',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Celeste - Hamburguesas Artesanales',
    description: 'Las mejores hamburguesas de Barquisimeto',
    images: ['/og-image.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-cream-50" suppressHydrationWarning>
        <AppInit>
          {children}
        </AppInit>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              padding: '16px',
            },
          }}
        />
      </body>
    </html>
  );
}
