'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MapMarkerItem } from '@/types';
import { getSpeciesEmoji, formatTimeAgo } from '@/lib/utils';
import { Crosshair, Filter, Layers, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  markers?: MapMarkerItem[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  onMarkerSelect?: (marker: MapMarkerItem) => void;
  selectedMarkerId?: string | null;
  height?: string;
}

export default function InteractiveMap({
  markers = [],
  center = [-43.24895, -65.30505], // Trelew Centro
  zoom = 14,
  onMarkerSelect,
  selectedMarkerId,
  height = '500px',
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'lost' | 'found' | 'sighting'>('all');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Inicializar mapa de Leaflet
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!leafletMapRef.current && isMounted && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: center,
          zoom: zoom,
          zoomControl: false,
        });

        // Capa pública y 100% gratuita de OpenStreetMap (sin API Key ni marcas de agua)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores en el mapa
  useEffect(() => {
    async function updateMarkers() {
      if (!leafletMapRef.current || !markersLayerRef.current) return;
      const L = (await import('leaflet')).default;

      markersLayerRef.current.clearLayers();

      const filtered = markers.filter(
        (m) => activeFilter === 'all' || m.marker_type === activeFilter
      );

      filtered.forEach((m) => {
        let colorBg = 'bg-rose-500';
        let borderColor = 'border-rose-600';
        let badgeText = 'PERDIDO';
        if (m.marker_type === 'found') {
          colorBg = 'bg-emerald-500';
          borderColor = 'border-emerald-600';
          badgeText = 'ENCONTRADO';
        } else if (m.marker_type === 'sighting') {
          colorBg = 'bg-amber-500';
          borderColor = 'border-amber-600';
          badgeText = 'AVISTAMIENTO';
        }

        const isSelected = selectedMarkerId === m.marker_id;
        const emoji = getSpeciesEmoji(m.species);

        const customHtml = `
          <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-full cursor-pointer group">
            <div class="w-10 h-10 rounded-2xl ${colorBg} border-2 ${borderColor} shadow-lg flex items-center justify-center text-white text-lg transition-transform duration-200 ${
              isSelected ? 'scale-125 ring-4 ring-orange-400' : 'hover:scale-110'
            }">
              <span>${emoji}</span>
            </div>
            <div class="w-2.5 h-2.5 bg-inherit border-r-2 border-b-2 ${borderColor} transform rotate-45 -mt-1.5 ${colorBg}"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-map-marker',
          iconSize: [40, 48],
          iconAnchor: [20, 48],
        });

        const marker = L.marker([m.latitude, m.longitude], { icon }).addTo(
          markersLayerRef.current
        );

        marker.on('click', () => {
          if (onMarkerSelect) onMarkerSelect(m);
        });

        // Popup interactivo
        const popupContent = `
          <div class="p-1 max-w-[200px] text-zinc-900 font-sans">
            ${
              m.photo_url
                ? `<img src="${m.photo_url}" alt="${m.title}" class="w-full h-24 object-cover rounded-lg mb-2 shadow-xs" />`
                : ''
            }
            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${colorBg} text-white mb-1">
              ${badgeText}
            </span>
            <h4 class="font-bold text-sm leading-tight">${m.title}</h4>
            <p class="text-xs text-zinc-500 mt-0.5">${formatTimeAgo(m.report_date)}</p>
            <a href="/mascotas-perdidas/${m.marker_id}" class="mt-2 block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold py-1.5 rounded-md transition-colors">
              Ver ficha completa
            </a>
          </div>
        `;
        marker.bindPopup(popupContent, { maxWidth: 220 });
      });
    }

    updateMarkers();
  }, [markers, activeFilter, selectedMarkerId, onMarkerSelect]);

  // Centrar en ubicación del usuario (GPS con fallback inteligente)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en tu navegador');
      return;
    }
    setIsLocating(true);

    const applyLocation = async (lat: number, lng: number) => {
      setIsLocating(false);
      setUserLocation([lat, lng]);

      if (leafletMapRef.current) {
        const L = (await import('leaflet')).default;
        leafletMapRef.current.flyTo([lat, lng], 15, { duration: 1.5 });

        // Marcador de usuario con pulso
        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
              <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white">
                <div class="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          `,
          className: 'user-gps-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        L.marker([lat, lng], { icon: userIcon }).addTo(markersLayerRef.current);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // Reintentar con baja precisión (WiFi/IP) para PCs
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            applyLocation(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            setIsLocating(false);
            if (err.code === 1) {
              alert('Permiso de ubicación denegado. Podés habilitarlo tocando el candado de la barra de direcciones o navegar el mapa manualmente.');
            } else {
              alert('No se pudo detectar sensor GPS en este dispositivo. Podés explorar el mapa desplazándote con el mouse o dedo.');
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800" style={{ height }}>
      {/* Contenedor Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Barra de Filtros Flotante */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === 'all'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Todos ({markers.length})
        </button>
        <button
          onClick={() => setActiveFilter('lost')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === 'lost'
              ? 'bg-rose-600 text-white'
              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Perdidas
        </button>
        <button
          onClick={() => setActiveFilter('found')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === 'found'
              ? 'bg-emerald-600 text-white'
              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Encontradas
        </button>
        <button
          onClick={() => setActiveFilter('sighting')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === 'sighting'
              ? 'bg-amber-600 text-white'
              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Avistamientos
        </button>
      </div>

      {/* Botón GPS Mi Ubicación */}
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        aria-label="Usar mi ubicación GPS"
        className="absolute bottom-20 right-3 z-10 w-11 h-11 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition-all"
      >
        <Crosshair className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
