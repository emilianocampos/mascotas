import React from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  HeartHandshake, 
  Eye, 
  Compass, 
  MapPin, 
  Sparkles,
  Heart,
  ChevronRight,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { getNearbyLostReports, getNearbyFoundReports, getAdminStats } from '@/services/reports.service';
import { PetReportCard } from '@/components/cards/PetReportCard';

export const revalidate = 60; // ISR cada 60 segundos

export default async function HomePage() {
  const [lostReports, foundReports, stats] = await Promise.all([
    getNearbyLostReports(-43.24895, -65.30505, 10000),
    getNearbyFoundReports(-43.24895, -65.30505, 10000),
    getAdminStats(),
  ]);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section — Comunicación Inmediata y 4 Acciones Principales */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-zinc-50 to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-200/60 dark:border-zinc-800/60 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider shadow-xs">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            Red Ciudadana • Trelew, Chubut
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            Ayudemos a reunir <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              mascotas con sus familias
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            Publicá en 60 segundos, informá un avistamiento geolocalizado o explorá el mapa en tiempo real.
          </p>

          {/* 4 BOTONES DE ACCIÓN PRINCIPALES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6 max-w-5xl mx-auto">
            
            {/* 1. PERDÍ UNA MASCOTA */}
            <Link
              id="tour-btn-lost"
              href="/publicar/perdida"
              className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-red-500/50 dark:hover:border-red-500/50 transform active:scale-95 transition-all text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200/60 dark:border-red-900/60 flex items-center justify-center mb-2.5 text-red-600 dark:text-red-400 group-hover:scale-110 group-hover:bg-red-100 transition-transform">
                <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-xs sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">
                Perdí mi mascota
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400 mt-0.5">
                🚨 Activar búsqueda
              </span>
            </Link>

            {/* 2. ENCONTRÉ UNA MASCOTA */}
            <Link
              id="tour-btn-found"
              href="/publicar/encontrada"
              className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transform active:scale-95 transition-all text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center mb-2.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-100 transition-transform">
                <HeartHandshake className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-xs sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
                La encontré
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                🏠 La tengo en tránsito
              </span>
            </Link>

            {/* 3. VI UNA MASCOTA (AVISTAMIENTO) */}
            <Link
              id="tour-btn-sighting"
              href="/publicar/avistamiento"
              className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-amber-500/50 dark:hover:border-amber-500/50 transform active:scale-95 transition-all text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60 flex items-center justify-center mb-2.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:bg-amber-100 transition-transform">
                <Eye className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-xs sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                Vi una mascota
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                🟡 Avisar en la calle
              </span>
            </Link>

            {/* 4. EXPLORAR MAPA */}
            <Link
              id="tour-btn-map"
              href="/mapa"
              className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-orange-500/50 dark:hover:border-orange-500/50 transform active:scale-95 transition-all text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-900/60 flex items-center justify-center mb-2.5 text-orange-500 dark:text-orange-400 group-hover:scale-110 group-hover:bg-orange-100 transition-transform">
                <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-xs sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors">
                Explorar Mapa
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                🗺️ En vivo en Trelew
              </span>
            </Link>

          </div>

          {/* Métricas Reales en Vivo */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-8 max-w-xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800/80">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.total_reunited_pets}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Mascotas Reunidas ❤️
              </div>
            </div>
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                {stats.active_lost_reports}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Búsquedas Activas
              </div>
            </div>
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <div className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">
                {stats.total_sightings}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Avistamientos
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Grid de Búsquedas Activas en Trelew */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
              Mascotas Perdidas Cerca de Trelew
            </h2>
            <p className="text-sm text-zinc-500">
              Reportes activos ordenados por proximidad y fecha reciente.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lostReports.map((report) => (
            <PetReportCard key={report.id} report={report} type="lost" />
          ))}
        </div>
      </section>

      {/* Grid de Mascotas Encontradas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Mascotas Encontradas en Tránsito
            </h2>
            <p className="text-sm text-zinc-500">
              Animales resguardados por vecinos buscando a sus dueños legítimos.
            </p>
          </div>
          <Link
            href="/publicar/encontrada"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            ¿Encontraste uno? Publicalo gratis
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foundReports.map((report) => (
            <PetReportCard key={report.id} report={report} type="found" />
          ))}
        </div>
      </section>

    </div>
  );
}
