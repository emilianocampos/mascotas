import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Mascotas Trelew — Red Comunitaria de Mascotas Perdidas y Encontradas',
  description:
    'Plataforma ciudadana geolocalizada para buscar, reportar avistamientos y reunir mascotas con sus familias en Trelew, Rawson y Chubut.',
  keywords: [
    'perros perdidos Trelew',
    'gatos perdidos Trelew',
    'mascotas encontradas Trelew',
    'avistamientos mascotas Chubut',
    'reunificación mascotas',
  ],
  openGraph: {
    title: 'Mascotas Trelew — Ayudemos a reunir mascotas con sus familias',
    description: 'Búsqueda comunitaria y geolocalizada de mascotas perdidas y encontradas en Trelew.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Mascotas Trelew',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-orange-500 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
