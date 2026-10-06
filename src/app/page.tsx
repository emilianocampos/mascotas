import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight,
  Compass,
  Sparkles
} from 'lucide-react';
import { getAllPublishedReports, getAdminStats } from '@/services/reports.service';
import { PaginatedPetReportsGrid } from '@/components/cards/PaginatedPetReportsGrid';
import { ParallaxHero } from '@/components/home/ParallaxHero';

// Revalidar en segundo plano cada 60 segundos (ISR)
// Permite que Vercel sirva la página desde Edge CDN con 0ms compute y mínimo bandwidth
export const revalidate = 60;

export default async function HomePage() {
  const [initialReports, stats] = await Promise.all([
    getAllPublishedReports(-43.24895, -65.30505, 10000, 'all', undefined, 6, 0),
    getAdminStats(),
  ]);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section con Paralaje Dinámico en Pantalla Completa (Mobile First) */}
      <ParallaxHero stats={stats} />

      {/* Grid Unificado de Publicaciones Recientes (Limitado a 6 inicial + carga de 6 en 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
              Publicaciones Recientes en Trelew
            </h2>
            <p className="text-sm text-zinc-500">
              Mascotas perdidas y encontradas en la comunidad, ordenadas por cercanía y fecha.
            </p>
          </div>
          <Link
            href="/mapa"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            Ver todas en el mapa interactivo
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Muro unificado paginado de 6 en 6 con filtros rápidos */}
        <PaginatedPetReportsGrid 
          initialReports={initialReports} 
          type="all" 
          chunkSize={6} 
          emptyMessage="No hay publicaciones activas en este momento." 
          showFilters={true}
        />
      </section>

    </div>
  );
}
