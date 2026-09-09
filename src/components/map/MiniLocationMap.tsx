'use client';

import React, { useEffect, useRef } from 'react';

interface MiniLocationMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export default function MiniLocationMap({ latitude, longitude, title }: MiniLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!isMounted || !mapContainerRef.current) return;

      // Destruir mapa previo si existe
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marcador personalizado de avistamiento (amarillo / amber)
      const customHtml = `
        <div style="width: 34px; height: 42px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
          <div style="width: 32px; height: 32px; border-radius: 12px; background-color: #f59e0b; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(245,158,11,0.5); display: flex; items-align: center; justify-content: center; font-size: 16px; line-height: 28px; text-align: center;">
            🟡
          </div>
          <div style="width: 10px; height: 10px; background-color: #f59e0b; border-right: 2.5px solid #ffffff; border-bottom: 2.5px solid #ffffff; transform: rotate(45deg); margin-top: -5px;"></div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-sighting-map-marker',
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([latitude, longitude], { icon }).addTo(map);
      if (title) {
        marker.bindPopup(`<b>${title}</b>`);
      }

      // Círculo de área aproximada
      L.circle([latitude, longitude], {
        color: '#f59e0b',
        fillColor: '#fbbf24',
        fillOpacity: 0.15,
        radius: 100,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[250px] z-0" />;
}
