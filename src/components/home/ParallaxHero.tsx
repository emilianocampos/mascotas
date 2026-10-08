'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusCircle, Eye, Compass } from 'lucide-react';
import { AdminDashboardStats } from '@/types';

interface ParallaxHeroProps {
  stats: AdminDashboardStats;
  isReady?: boolean;
}

export function ParallaxHero({ stats, isReady = true }: ParallaxHeroProps) {
  const [loadingBtn, setLoadingBtn] = useState<'lost' | 'sighting' | 'map' | null>(null);

  return (
    <div
      className="relative min-h-[75vh] sm:min-h-[70vh] flex flex-col justify-center overflow-hidden border-b border-zinc-200/60 dark:border-zinc-800/60 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 dark:bg-zinc-950"
    >
      {/* Fondos y gradientes ambientales suaves */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Glows superiores */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-orange-400/20 via-amber-300/15 to-rose-400/10 dark:from-orange-600/15 dark:via-amber-500/10 dark:to-rose-600/10 rounded-full blur-3xl" />
        
        {/* Glow lateral izquierdo */}
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-red-400/10 dark:bg-red-900/10 rounded-full blur-2xl" />

        {/* Glow lateral derecho */}
        <div className="absolute top-1/2 -right-20 w-72 h-72 bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-2xl" />
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-5 my-auto">
        
        {/* Badge de Ciudad */}
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.95 }}
          animate={isReady ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 dark:bg-orange-950/70 border border-orange-200/80 dark:border-orange-800/60 text-orange-800 dark:text-orange-200 text-xs font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>Red Ciudadana • Trelew, Chubut</span>
        </motion.div>

        {/* Título Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]"
        >
          Ayudemos a reunir <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
            mascotas con sus familias
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
          className="text-sm sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-medium leading-relaxed px-2"
        >
          Publicá en 60 segundos, informá un avistamiento geolocalizado o explorá el mapa comunitario en tiempo real.
        </motion.p>

        {/* 3 BOTONES DE ACCIÓN PRINCIPALES (Con barra de carga de progreso en el background) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 max-w-4xl mx-auto"
        >
          {/* 1. PERDÍ UNA MASCOTA */}
          <motion.div
            whileHover={{ scale: 1.03, translateY: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Link
              id="tour-btn-lost"
              href="/publicar/perdida"
              onClick={() => setLoadingBtn('lost')}
              className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-red-500 dark:hover:border-red-500 transition-all text-center h-full cursor-pointer overflow-hidden"
            >
              {/* Barra de carga de progreso en el background */}
              {loadingBtn === 'lost' && (
                <>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/20 to-rose-500/25 origin-left pointer-events-none rounded-2xl z-0"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 origin-left pointer-events-none rounded-b-2xl z-10"
                  />
                </>
              )}

              <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-rose-600 border border-red-400/40 flex items-center justify-center mb-2 text-white group-hover:scale-110 transition-all shadow-md shadow-red-600/25">
                <PlusCircle className={`w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2.5] transition-transform duration-300 ${loadingBtn === 'lost' ? 'animate-spin' : ''}`} />
              </div>
              <span className="relative z-10 text-sm sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">
                Perdí mi mascota
              </span>
              <span className="relative z-10 text-[11px] sm:text-xs font-bold text-red-600 dark:text-red-400 mt-0.5">
                🚨 Activar búsqueda
              </span>
            </Link>
          </motion.div>

          {/* 2. VI / ENCONTRÉ UNA MASCOTA */}
          <motion.div
            whileHover={{ scale: 1.03, translateY: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Link
              id="tour-btn-sighting"
              href="/publicar/avistamiento"
              onClick={() => setLoadingBtn('sighting')}
              className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-amber-500 dark:hover:border-amber-500 transition-all text-center h-full cursor-pointer overflow-hidden"
            >
              {/* Barra de carga de progreso en el background */}
              {loadingBtn === 'sighting' && (
                <>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/25 origin-left pointer-events-none rounded-2xl z-0"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 origin-left pointer-events-none rounded-b-2xl z-10"
                  />
                </>
              )}

              <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 border border-amber-300/40 flex items-center justify-center mb-2 text-white group-hover:scale-110 transition-all shadow-md shadow-amber-500/25">
                <Eye className={`w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2.5] transition-transform duration-300 ${loadingBtn === 'sighting' ? 'animate-spin' : ''}`} />
              </div>
              <span className="relative z-10 text-sm sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                Vi / Encontré una mascota
              </span>
              <span className="relative z-10 text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                🏠 En tránsito o 🟡 en la calle
              </span>
            </Link>
          </motion.div>

          {/* 3. EXPLORAR MAPA */}
          <motion.div
            whileHover={{ scale: 1.03, translateY: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Link
              id="tour-btn-map"
              href="/mapa"
              onClick={() => setLoadingBtn('map')}
              className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all text-center h-full cursor-pointer overflow-hidden"
            >
              {/* Barra de carga de progreso en el background */}
              {loadingBtn === 'map' && (
                <>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/20 to-orange-500/25 origin-left pointer-events-none rounded-2xl z-0"
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 origin-left pointer-events-none rounded-b-2xl z-10"
                  />
                </>
              )}

              <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-900/60 flex items-center justify-center mb-2 text-orange-500 dark:text-orange-400 group-hover:scale-110 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/80 transition-all shadow-xs">
                <Compass className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 ${loadingBtn === 'map' ? 'animate-spin' : ''}`} />
              </div>
              <span className="relative z-10 text-sm sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors">
                Explorar Mapa
              </span>
              <span className="relative z-10 text-[11px] sm:text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                🗺️ En vivo en Trelew
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Métricas Reales en Vivo */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
          className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 max-w-xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800/80"
        >
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.total_reunited_pets}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Mascotas Reunidas ❤️
            </div>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {stats.active_lost_reports}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Búsquedas Activas 🚨
            </div>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">
              {stats.total_sightings}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Avistadas 🐾
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
