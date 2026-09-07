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
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Filtros Rápidos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-orange-500" />
            Mapa Interactivo de Búsqueda
          </h1>
          <p className="text-sm text-zinc-500">
            Explorá animales perdidos 🔴, encontrados 🟢 y avistamientos 🟡 en Trelew y alrededores.
          </p>
        </div>

        {/* Controles de Filtro por Especie y Radio */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Especie */}
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value as any)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl px-3 py-2 text-zinc-700 dark:text-zinc-300 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las especies 🐾</option>
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
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl px-3 py-2 text-zinc-700 dark:text-zinc-300 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value={1000}>Radio: 1 km</option>
            <option value={2000}>Radio: 2 km</option>
            <option value={5000}>Radio: 5 km (Trelew Centro)</option>
            <option value={10000}>Radio: 10 km (Todo Trelew)</option>
            <option value={25000}>Radio: 25 km (+ Rawson / Gaiman)</option>
          </select>
        </div>
      </div>

      {/* Grid Principal: Mapa Grande + Panel Lateral de Reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Mapa Interactivo (2 columnas en desktop) */}
        <div className="lg:col-span-2">
          <InteractiveMap
            markers={markers}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={handleMarkerSelect}
            height="580px"
          />
        </div>

        {/* Listado lateral sincronizado por proximidad */}
        <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
          <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-950 pb-2 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <List className="w-4 h-4 text-orange-500" />
              Publicaciones Cercanas ({lostReports.length})
            </h3>
            <span className="text-xs text-zinc-400">Ordenadas por distancia</span>
          </div>

          <div className="space-y-4">
            {lostReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedMarkerId(report.id)}
                className={`cursor-pointer transition-all ${
                  selectedMarkerId === report.id ? 'ring-2 ring-orange-500 rounded-2xl' : ''
                }`}
              >
                <PetReportCard report={report} type="lost" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
