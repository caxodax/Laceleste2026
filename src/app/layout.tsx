import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AppInit } from '@/components/layout/AppInit';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Celeste - Hamburguesas Artesanales | Barquisimeto',
  description: 'Las mejores hamburguesas artesanales de Barquisimeto. Inspiradas en los sabores de Argentina. Pedidos por WhatsApp e Instagram.',
  keywords: ['hamburguesas', 'barquisimeto', 'la celeste', 'comida rapida', 'delivery'],
  authors: [{ name: 'La Celeste' }],
  openGraph: {
    title: 'La Celeste - Hamburguesas Artesanales',
    description: 'Las mejores hamburguesas artesanales de Barquisimeto',
    type: 'website',
    locale: 'es_VE',
    siteName: 'La Celeste',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Celeste - Hamburguesas Artesanales',
    description: 'Las mejores hamburguesas artesanales de Barquisimeto',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-cream-50">
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
