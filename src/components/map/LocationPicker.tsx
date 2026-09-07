'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Crosshair, MapPin, Search, Navigation, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  label?: string;
  helperText?: string;
}

const POPULAR_TRELEW_ZONES = [
  { name: 'Centro / Plaza', address: 'San Martín y Mitre', lat: -43.2529, lng: -65.3094 },
  { name: 'Padre Juan / Conesa', address: 'Conesa y Cutillo', lat: -43.2435, lng: -65.2965 },
  { name: 'Laguna Chiquichano', address: 'Av. Lewis Jones y Alem', lat: -43.2492, lng: -65.2965 },
  { name: 'Los Aromos', address: 'Soberanía Nacional y Chile', lat: -43.2615, lng: -65.3260 },
  { name: 'Terminal', address: 'Urquiza y Colombia', lat: -43.2562, lng: -65.3040 },
];

export default function LocationPicker({
  initialLat = -43.24895, // Trelew
  initialLng = -65.30505,
  onLocationChange,
  label = 'Ubicación en el mapa',
  helperText = 'Tocá el mapa o arrastrá el marcador hacia el lugar exacto. La calle y número se completarán automáticamente.',
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Mantener referencia fresca a la función de callback para evitar stale closures
  const onLocationChangeRef = useRef(onLocationChange);
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Obtener ÚNICAMENTE el nombre de la calle y número (sin barrios confusos ni chacras)
  const fetchAddressFromCoords = async (lat: number, lng: number): Promise<string | null> => {
    try {
      setIsGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es',
          },
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || addr.street || addr.footway || addr.path || addr.avenue || '';
      const houseNumber = addr.house_number || '';

      // Si detecta la calle, poner ÚNICAMENTE calle y número (limpiando cualquier sufijo de barrio)
      if (road) {
        const cleanRoad = road.split(',')[0].replace(/\s+/g, ' ').trim();
        return houseNumber ? `${cleanRoad} ${houseNumber}` : cleanRoad;
      }

      if (data.display_name) {
        const firstPart = data.display_name
          .split(',')
          .filter((p: string) => !/chacra|parcela|lote|radio|barrio|b°|bº/i.test(p))[0]
          ?.trim();
        return firstPart || null;
      }

      return null;
    } catch (e) {
      console.error('Error reverse geocoding:', e);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  const handlePositionChanged = async (lat: number, lng: number, directAddress?: string) => {
    setCoords({ lat, lng });

    // Si viene de un botón de zona rápida directa
    if (directAddress) {
      onLocationChangeRef.current(lat, lng, directAddress);
      return;
    }

    // Notificar coordenadas inmediatamente
    onLocationChangeRef.current(lat, lng);

    // Obtener la calle y número exacto
    const address = await fetchAddressFromCoords(lat, lng);
    if (address) {
      onLocationChangeRef.current(lat, lng, address);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initPicker() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mapRef.current && isMounted && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 15,
        });

        // Capa pública y 100% gratuita de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        const customPin = L.divIcon({
          html: `
            <div style="width: 28px; height: 38px; position: relative; cursor: grab; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35));">
              <svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Pin Body with Sharp Needle Tip at x=14, y=38 -->
                <path d="M14 0C6.268 0 0 6.268 0 14C0 22.5 11 34.5 14 38C17 34.5 28 22.5 28 14C28 6.268 21.732 0 14 0Z" fill="#E11D48"/>
                <!-- White inner badge -->
                <circle cx="14" cy="14" r="10" fill="#FFFFFF"/>
                <!-- Center point -->
                <circle cx="14" cy="14" r="5.5" fill="#E11D48"/>
              </svg>
            </div>
          `,
          className: 'picker-pin-wrapper',
          iconSize: [28, 38],
          iconAnchor: [14, 38],
          popupAnchor: [0, -38],
        });

        const marker = L.marker([coords.lat, coords.lng], {
          icon: customPin,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', (e: any) => {
          const newPos = e.target.getLatLng();
          handlePositionChanged(newPos.lat, newPos.lng);
        });

        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          handlePositionChanged(e.latlng.lat, e.latlng.lng);
        });

        markerRef.current = marker;
        mapRef.current = map;
      }
    }

    initPicker();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const setLocationDirect = (lat: number, lng: number, address?: string) => {
    setCoords({ lat, lng });
    handlePositionChanged(lat, lng, address);
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización. Podés tocar el mapa o elegir una zona rápida.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Solicitando ubicación al navegador...');

    // Intentar primero con configuración estándar (muy compatible con PCs y celulares)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocationStatus('📍 ¡Ubicación obtenida correctamente!');
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocationDirect(lat, lng);
        setTimeout(() => setLocationStatus(null), 3500);
      },
      (err) => {
        // Si falla con alta precisión, reintentar con baja precisión (WiFi/IP)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setIsLocating(false);
            setLocationStatus('📍 Ubicación aproximada obtenida.');
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setLocationDirect(lat, lng);
            setTimeout(() => setLocationStatus(null), 3500);
          },
          (secondErr) => {
            setIsLocating(false);
            if (secondErr.code === 1) {
              setLocationStatus('⚠️ Permiso denegado. Tocá el icono del candado en la barra de tu navegador para permitir la ubicación o seleccioná en el mapa.');
            } else {
              setLocationStatus('💡 No se pudo detectar GPS en esta PC. Podés mover el mapa o tocar uno de los accesos rápidos de abajo.');
            }
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-orange-500" />
          {label}
        </label>

        <div className="flex items-center gap-2">
          {isGeocoding && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Leyendo calle del mapa...
            </span>
          )}

          <button
            type="button"
            onClick={handleUseGPS}
            disabled={isLocating}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Obteniendo GPS...' : 'Usar mi ubicación actual'}
          </button>
        </div>
      </div>

      {locationStatus && (
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs animate-in fade-in">
          {locationStatus}
        </div>
      )}

      <p className="text-xs text-zinc-500">{helperText}</p>

      {/* Selector Rápido de Zonas de Trelew */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-orange-500" /> Zonas rápidas:
        </span>
        {POPULAR_TRELEW_ZONES.map((zone) => (
          <button
            key={zone.name}
            type="button"
            onClick={() => setLocationDirect(zone.lat, zone.lng, zone.address)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 hover:text-orange-600 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            {zone.name}
          </button>
        ))}
      </div>

      {/* Contenedor del Mapa */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute bottom-2 left-2 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
          Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
        </div>
      </div>
    </div>
  );
}
