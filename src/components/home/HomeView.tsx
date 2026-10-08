'use client';

import React, { useState } from 'react';
import { AdminDashboardStats, LostReport, FoundReport } from '@/types';
import { UnifiedReport } from '@/services/reports.service';
import { CapybaraLoader } from '@/components/home/CapybaraLoader';
import { ParallaxHero } from '@/components/home/ParallaxHero';
import { ParallaxPetSection } from '@/components/home/ParallaxPetSection';

interface HomeViewProps {
  stats: AdminDashboardStats;
  initialReports: (LostReport | FoundReport | UnifiedReport)[];
}

export function HomeView({ stats, initialReports }: HomeViewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="space-y-12 pb-16">
      {/* Loader de Pantalla Completa (desencadena las animaciones al finalizar) */}
      <CapybaraLoader onFinish={() => setIsLoaded(true)} />

      {/* Hero Section: Inicia las animaciones de botones y textos recién cuando se abre el loader */}
      <ParallaxHero stats={stats} isReady={isLoaded} />

      {/* Sección de Mascotas y Publicaciones Recientes */}
      <ParallaxPetSection initialReports={initialReports} />
    </div>
  );
}
