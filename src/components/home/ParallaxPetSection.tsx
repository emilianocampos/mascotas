'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PaginatedPetReportsGrid } from '@/components/cards/PaginatedPetReportsGrid';
import { LostReport, FoundReport } from '@/types';
import { UnifiedReport } from '@/services/reports.service';

interface ParallaxPetSectionProps {
  initialReports: (LostReport | FoundReport | UnifiedReport)[];
}

export function ParallaxPetSection({ initialReports }: ParallaxPetSectionProps) {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Cabecera limpia y ligera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse ring-4 ring-orange-500/20" />
            Publicaciones Recientes en Trelew
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Mascotas perdidas y encontradas en la comunidad, ordenadas por cercanía y fecha.
          </p>
        </div>
        <Link
          href="/mapa"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline transition-colors"
        >
          Ver todas en el mapa interactivo
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid de Reportes con Cards optimizadas con efecto de paralaje 3D */}
      <PaginatedPetReportsGrid
        initialReports={initialReports}
        type="all"
        chunkSize={6}
        emptyMessage="No hay publicaciones activas en este momento."
        showFilters={true}
      />
    </section>
  );
}
