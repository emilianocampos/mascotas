import React from 'react';
import { getAllPublishedReports, getAdminStats } from '@/services/reports.service';
import { HomeView } from '@/components/home/HomeView';

// Revalidar en segundo plano cada 60 segundos (ISR)
// Permite que Vercel sirva la página desde Edge CDN con 0ms compute y mínimo bandwidth
export const revalidate = 60;

export default async function HomePage() {
  const [initialReports, stats] = await Promise.all([
    getAllPublishedReports(-43.24895, -65.30505, 10000, 'all', undefined, 6, 0),
    getAdminStats(),
  ]);

  return <HomeView stats={stats} initialReports={initialReports} />;
}
