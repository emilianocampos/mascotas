'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

export interface StreetSuggestion {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Ej: San Martín 450 o Conesa y Cutillo',
  label = 'Calle y Número o Esquina',
  required = true,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<StreetSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sincronizar si cambia desde afuera (ej: al mover el pin del mapa)
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Debounce para consultar OpenStreetMap en Trelew / Chubut
  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const query = encodeURIComponent(`${inputValue.trim()}, Trelew, Chubut`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${query}&addressdetails=1&limit=5`,
          {
            headers: {
              'Accept-Language': 'es',
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          const items: StreetSuggestion[] = (data || []).map((item: any) => {
            const addr = item.address || {};
            const road = addr.road || addr.pedestrian || addr.street || addr.footway || addr.avenue || '';
            const houseNumber = addr.house_number || '';
            const streetName = road ? (houseNumber ? `${road} ${houseNumber}` : road) : item.display_name.split(',')[0];
            return {
              id: item.place_id?.toString() || Math.random().toString(),
              name: streetName.trim(),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            };
          });
          setSuggestions(items);
          setIsOpen(items.length > 0);
        }
      } catch (err) {
        console.error('Error al buscar calles en OpenStreetMap:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (s: StreetSuggestion) => {
    setInputValue(s.name);
    setIsOpen(false);
    onChange(s.name, { lat: s.lat, lng: s.lng });
  };

  return (
    <div ref={wrapperRef} className="relative space-y-1">
      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
            <span>Sugerencias de calles</span>
            <span>Elegí una para centrar</span>
          </div>

          <ul className="max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {suggestions.map((s) => (
              <li
                key={s.id}
                onClick={() => handleSelect(s)}
                className="px-3.5 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {s.name}
                  </p>
                </div>

                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  Centrar
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
