'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getNearbyLostReports, getNearbyFoundReports, getMapMarkers } from '@/services/reports.service';
import { LostReport, FoundReport, MapMarkerItem, PetSpecies } from '@/types';
import { PetReportCard } from '@/components/cards/PetReportCard';
import { 
  Compass, 
  Filter, 
  MapPin, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  List
} from 'lucide-react';

// Dynamic import of InteractiveMap to avoid SSR issues with Leaflet window object
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 animate-pulse">
        <Compass className="w-8 h-8 animate-spin text-orange-500 mr-2" />
        <span>Cargando mapa interactivo...</span>
      </div>
    ),
  }
);

export default function MapaPage() {
  const [markers, setMarkers] = useState<MapMarkerItem[]>([]);
  const [lostReports, setLostReports] = useState<LostReport[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<PetSpecies | 'all'>('all');
  const [radiusFilter, setRadiusFilter] = useState<number>(5000); // 5km
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    async function loadData() {
      const [markerData, lostData] = await Promise.all([
        getMapMarkers(),
        getNearbyLostReports(-43.24895, -65.30505, radiusFilter, speciesFilter),
      ]);
      setMarkers(markerData);
      setLostReports(lostData);
    }
    loadData();
  }, [speciesFilter, radiusFilter]);

  const handleMarkerSelect = (marker: MapMarkerItem) => {
    setSelectedMarkerId(marker.marker_id);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Header & Filtros Rápidos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
            Mapa Interactivo de Búsqueda
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Animales perdidos 🔴, encontrados 🟢 y avistamientos 🟡 en Trelew.
          </p>
        </div>

        {/* Controles de Filtro por Especie y Radio */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Especie */}
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value as any)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl px-2.5 sm:px-3 py-2 text-zinc-700 dark:text-zinc-300 shadow-xs focus:outline-none cursor-pointer shrink-0"
          >
            <option value="all">Especies: Todas 🐾</option>
            <option value="dog">Perros 🐕</option>
            <option value="cat">Gatos 🐈</option>
            <option value="bird">Aves 🦜</option>
            <option value="rabbit">Conejos 🐇</option>
            <option value="other">Otros 🐾</option>
          </select>

          {/* Radio de Distancia */}
          <select
            value={radiusFilter}
            onChange={(e) => setRadiusFilter(Number(e.target.value))}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl px-2.5 sm:px-3 py-2 text-zinc-700 dark:text-zinc-300 shadow-xs focus:outline-none cursor-pointer shrink-0"
          >
            <option value={1000}>1 km</option>
            <option value={2000}>2 km</option>
            <option value={5000}>5 km (Centro)</option>
            <option value={10000}>10 km (Trelew)</option>
            <option value={25000}>25 km (+ Valle)</option>
          </select>
        </div>
      </div>

      {/* Switcher Móvil: Mapa / Lista */}
      <div className="flex lg:hidden bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setMobileView('map')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileView === 'map'
              ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Ver Mapa
        </button>
        <button
          type="button"
          onClick={() => setMobileView('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileView === 'list'
              ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Ver Lista ({lostReports.length})
        </button>
      </div>

      {/* Grid Principal: Mapa Grande + Panel Lateral de Reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Mapa Interactivo */}
        <div className={`lg:col-span-2 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
          <InteractiveMap
            markers={markers}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={(m) => {
              handleMarkerSelect(m);
            }}
            height="520px"
          />
        </div>

        {/* Listado lateral sincronizado por proximidad */}
        <div className={`space-y-4 max-h-[580px] overflow-y-auto pr-1 ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-950 pb-2 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <List className="w-4 h-4 text-orange-500" />
              Publicaciones Cercanas ({lostReports.length})
            </h3>
            <span className="text-xs text-zinc-400">Ordenadas por distancia</span>
          </div>

          <div className="space-y-4">
            {lostReports.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                No hay reportes en el radio seleccionado.
              </div>
            ) : (
              lostReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedMarkerId(report.id);
                    setMobileView('map');
                  }}
                  className={`cursor-pointer transition-all ${
                    selectedMarkerId === report.id ? 'ring-2 ring-orange-500 rounded-2xl' : ''
                  }`}
                >
                  <PetReportCard report={report} type="lost" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
