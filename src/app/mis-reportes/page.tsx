'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { calculateMatchScore } from '@/services/matching.service';
import { LostReport, FoundReport } from '@/types';
import { 
  FileText, 
  Heart, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Share2, 
  PlusCircle,
  Clock,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MisReportesPage() {
  const [reunitedReports, setReunitedReports] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'lost' | 'found' | 'sightings'>('lost');

  const myLostReports: LostReport[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      user_id: 'u1',
      pet_id: 'p1',
      city_id: 1,
      status: reunitedReports.includes('11111111-1111-1111-1111-111111111111') ? 'REUNITED' : 'ACTIVE',
      last_seen_date: new Date(Date.now() - 3 * 3600000).toISOString(),
      last_seen_location: { latitude: -43.24895, longitude: -65.30505 },
      approximate_address: 'Plaza Independencia, Trelew Centro',
      description: 'Toby se asustó con un ruido y salió corriendo.',
      contact_phone_public: true,
      views_count: 142,
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      pet: {
        id: 'p1',
        name: 'Toby',
        species: 'dog',
        breed: 'Mestizo Golden',
        gender: 'male',
        size: 'medium',
        primary_color: 'Dorado',
        photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600'],
        created_at: new Date().toISOString(),
      },
    },
  ];

  const handleMarkReunited = (id: string, name: string) => {
    if (confirm(`¿Confirmás que ${name} ya está en casa contigo? 🎉`)) {
      setReunitedReports((prev) => [...prev, id]);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-orange-500" />
            Panel de Mis Reportes
          </h1>
          <p className="text-sm text-zinc-500">
            Administrá tus publicaciones activas, confirmá reunificaciones y revisá coincidencias.
          </p>
        </div>

        <Link
          href="/publicar/perdida"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Publicación
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setSelectedTab('lost')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedTab === 'lost'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Mascotas Perdidas (1)
        </button>
        <button
          onClick={() => setSelectedTab('found')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedTab === 'found'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Mascotas Encontradas (0)
        </button>
        <button
          onClick={() => setSelectedTab('sightings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedTab === 'sightings'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Avistamientos Aportados (1)
        </button>
      </div>

      {/* Listado de Reportes Propios */}
      <div className="space-y-6">
        {selectedTab === 'lost' && (
          <div className="space-y-6">
            {myLostReports.map((rep) => {
              const isReunited = rep.status === 'REUNITED';
              return (
                <div
                  key={rep.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-zinc-200">
                        <img
                          src={rep.pet?.photos[0]}
                          alt={rep.pet?.name || ''}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={rep.status} />
                          <span className="text-xs text-zinc-500">
                            Publicado {rep.last_seen_date.slice(0, 10)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                          {rep.pet?.name}
                        </h3>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {rep.approximate_address}
                        </p>
                      </div>
                    </div>

                    {/* Acciones del Dueño */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      {!isReunited ? (
                        <button
                          onClick={() => handleMarkReunited(rep.id, rep.pet?.name || 'tu mascota')}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          ¡YA LA ENCONTRÉ! REUNIDA ❤️
                        </button>
                      ) : (
                        <span className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          ❤️ Caso Exitoso Cerrado
                        </span>
                      )}

                      <Link
                        href={`/mascotas-perdidas/${rep.id}`}
                        className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition-colors"
                      >
                        Ver Publicación
                      </Link>
                    </div>
                  </div>

                  {/* Sugerencia de Coincidencia (Matching Engine) */}
                  {!isReunited && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>POSIBLE COINCIDENCIA DETECTADA (85% de similitud)</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Un vecino reportó haber encontrado un perro macho mestizo mediano en <strong>Av. Fontana y San Martín (a 800 metros)</strong>.
                      </p>
                      <Link
                        href="/mascotas-perdidas/44444444-4444-4444-4444-444444444444"
                        className="inline-block text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        Ver reporte de la mascota encontrada →
                      </Link>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
