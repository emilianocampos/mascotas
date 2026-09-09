'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Eye, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  Maximize2, 
  X, 
  ChevronLeft,
  Navigation,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Compass,
  UserCheck
} from 'lucide-react';
import { 
  formatTimeAgo, 
  formatDate, 
  parseGeoLocation,
  capitalizeFirst,
  capitalizeWords
} from '@/lib/utils';

// Cargar mapa dinámico sin SSR
const MiniLeafletMap = dynamic(
  () => import('@/components/map/MiniLocationMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 text-xs animate-pulse">
        Cargando mapa interactivo...
      </div>
    )
  }
);

interface SightingDetailProps {
  sighting: any;
}

export default function SightingDetailInteractive({ sighting }: SightingDetailProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const loc = parseGeoLocation(sighting.location) || { latitude: -43.24895, longitude: -65.30505 };
  const lostReport = sighting.lost_report;
  const linkedPet = lostReport?.pet;
  const ownerProfile = lostReport?.profile;

  const photo = sighting.photo_url;
  const formattedDate = formatDate(sighting.sighting_date);
  const timeAgo = formatTimeAgo(sighting.sighting_date);

  const cleanOwnerPhone = ownerProfile?.phone ? ownerProfile.phone.replace(/[^0-9]/g, '') : '';
  const petName = capitalizeWords(linkedPet?.name || 'la mascota');

  const whatsappMessage = `¡Hola! Vi el reporte de avistamiento de *${petName}* en Trelew:\n📍 *Ubicación:* ${capitalizeWords(sighting.approximate_address)}\n🕒 *Fecha/Hora:* ${formattedDate} (${timeAgo})\n📝 *Detalle:* ${capitalizeFirst(sighting.description)}\n\nPodés ver la ficha aquí: ${typeof window !== 'undefined' ? window.location.href : ''}`;

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `🟡 Avistamiento de mascota en Trelew: ${capitalizeWords(sighting.approximate_address)}`,
        text: `Se reportó un avistamiento de mascota en ${capitalizeWords(sighting.approximate_address)} (${timeAgo}). Mirá los detalles y fotos:`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Barra superior de navegación */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <Link 
          href="/mapa"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Mapa</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Tarjeta Principal */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl shadow-zinc-200/40 dark:shadow-none space-y-6">
        
        {/* Encabezado con Badge de Avistamiento */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-300 dark:border-amber-800/80">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>Avistamiento en Vía Pública</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
              {linkedPet?.name ? `Vieron a ${capitalizeWords(linkedPet.name)}` : 'Mascota Avistada'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Sección de Foto (con Lightbox al hacer click) */}
        {photo ? (
          <div className="relative group rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-h-[420px] flex items-center justify-center shadow-inner">
            <img 
              src={photo} 
              alt="Foto del avistamiento" 
              className="w-full h-full max-h-[420px] object-contain cursor-zoom-in group-hover:scale-102 transition-transform duration-300"
              onClick={() => setLightboxOpen(true)}
            />
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ver foto completa</span>
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto text-xl">
              👀
            </div>
            <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
              Avistamiento testimonial directo
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
              El vecino reportó el avistamiento sin fotografía en el momento. Los detalles visuales y de dirección se detallan a continuación.
            </p>
          </div>
        )}

        {/* Banner Vinculado a Mascota Perdida (Si corresponde) */}
        {lostReport && linkedPet && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-400 dark:border-amber-600/60 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-900 dark:text-amber-300 tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Avistamiento vinculado a búsqueda activa</span>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/90 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm">
              {linkedPet.photos?.[0] ? (
                <img 
                  src={linkedPet.photos[0]} 
                  alt={linkedPet.name} 
                  className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-2xl shrink-0">
                  🐾
                </div>
              )}

              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="font-black text-base text-zinc-900 dark:text-white truncate">
                  {capitalizeWords(linkedPet.name)}
                </h3>
                <p className="text-xs text-zinc-500 truncate">
                  {capitalizeWords(linkedPet.breed || 'Mascota perdida')} • Se busca en {capitalizeWords(lostReport.approximate_address)}
                </p>
                <Link 
                  href={`/mascotas-perdidas/${lostReport.id}`}
                  className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <span>Ver publicación original</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Botón de WhatsApp al dueño */}
            {cleanOwnerPhone && (
              <a 
                href={`https://wa.me/${cleanOwnerPhone}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 text-center cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>AVISAR AL DUEÑO POR WHATSAPP</span>
              </a>
            )}
          </div>
        )}

        {/* Grilla de Datos Detallados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Ubicación */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Lugar exacto / Esquina</span>
            </div>
            <p className="text-sm font-extrabold text-zinc-900 dark:text-white">
              {capitalizeWords(sighting.approximate_address || 'Trelew, Chubut')}
            </p>
          </div>

          {/* Fecha y Hora */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Momento del Avistamiento</span>
            </div>
            <p className="text-sm font-extrabold text-zinc-900 dark:text-white">
              {formattedDate}
            </p>
            <p className="text-xs text-zinc-500">
              Reportado {timeAgo}
            </p>
          </div>
        </div>

        {/* Descripción / Qué se vio */}
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Detalle y dirección del animal</span>
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-semibold">
            {capitalizeFirst(sighting.description || 'Sin descripción adicional.')}
          </p>
        </div>

        {/* Mini Mapa Interactivo de Ubicación del Avistamiento */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-900 dark:text-white">
              <Navigation className="w-4 h-4 text-amber-500" />
              <span>Punto de Avistamiento en el Mapa</span>
            </div>

            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>Abrir en Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm h-64 w-full">
            <MiniLeafletMap latitude={loc.latitude} longitude={loc.longitude} title={sighting.approximate_address} />
          </div>
        </div>

        {/* Acciones Finales */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href="/mapa"
            className="w-full sm:w-auto flex-1 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs uppercase tracking-wider text-center shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Ver en el Mapa General de Trelew</span>
          </Link>
          
          <button
            onClick={handleShare}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </button>
        </div>

      </div>

      {/* Lightbox / Visor de Foto Completa */}
      {lightboxOpen && photo && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-all cursor-pointer shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="relative max-w-4xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={photo} 
              alt="Foto completa del avistamiento" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <p className="mt-4 text-xs font-bold text-zinc-400">
            Avistamiento en {sighting.approximate_address} • {formattedDate}
          </p>
        </div>
      )}

    </div>
  );
}
