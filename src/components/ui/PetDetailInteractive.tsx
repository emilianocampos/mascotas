'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  Eye, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  Printer, 
  Maximize2, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert,
  ChevronLeft,
  Home,
  FileText
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  formatTimeAgo, 
  formatDate, 
  getSpeciesEmoji, 
  getSpeciesLabel, 
  getSizeLabel, 
  getGenderLabel,
  parseGeoLocation,
  capitalizeFirst,
  capitalizeWords
} from '@/lib/utils';
import { incrementReportViews } from '@/services/reports.service';

interface PetDetailInteractiveProps {
  report: any;
  sightings: any[];
}

export default function PetDetailInteractive({ report, sightings }: PetDetailInteractiveProps) {
  const isLost = report.report_type === 'lost';
  const isReunited = report.status === 'REUNITED';
  const pet = report.pet;
  const petName = capitalizeWords(pet?.name || (isLost ? 'Mascota perdida' : 'Mascota encontrada'));
  const reportDate = isLost ? report.last_seen_date : report.found_date;
  const location = isLost ? report.last_seen_location : report.found_location;
  const photo = pet?.photos?.[0] || 'https://images.unsplash.com/photo-1552053831-71594a27632d';

  // Estados interactivos
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterQrUrl, setPosterQrUrl] = useState<string>('');
  const [viewsCount, setViewsCount] = useState<number>(report.views_count || 0);

  // Incrementar +1 en personas que vieron la publicación al entrar
  useEffect(() => {
    let isMounted = true;
    async function trackView() {
      if (isLost && report.id) {
        const newCount = await incrementReportViews(report.id);
        if (isMounted && newCount > 0) {
          setViewsCount(newCount);
        } else if (isMounted) {
          setViewsCount((prev) => prev + 1);
        }
      }
    }
    trackView();
    return () => {
      isMounted = false;
    };
  }, [report.id, isLost]);

  // Generar QR para el cartel imprimible
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/mascotas-perdidas/${report.id}`;
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#b91c1c', // Red-700
          light: '#ffffff',
        },
      }).then(setPosterQrUrl);
    }
  }, [report.id]);

  const handleShare = () => {
    const url = `${window.location.origin}/mascotas-perdidas/${report.id}`;
    if (navigator.share) {
      navigator.share({
        title: `🐾 ${petName.toUpperCase()} en Trelew`,
        text: `¡Ayudanos a encontrar a ${petName}! Compartí en tus grupos de WhatsApp o redes:`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* VISTA NORMAL DE LA PÁGINA (Se oculta al imprimir con class print:hidden)   */}
      {/* ========================================================================= */}
      <div className="print:hidden space-y-8">
        
        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between">
          <Link
            href="/mapa"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al mapa
          </Link>
          <div className="flex items-center gap-3">
            {isLost && (
              <button
                onClick={() => setShowPosterModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-red-600" />
                <span>Imprimir Cartel A4</span>
              </button>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Inicio
            </Link>
          </div>
        </div>

        {/* Banner de Estado */}
        {isReunited ? (
          <div className="p-6 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 text-center space-y-2">
            <span className="text-4xl">🎉 ❤️ 🏠</span>
            <h2 className="text-2xl sm:text-3xl font-black">
              ¡{petName.toUpperCase()} YA FUE REUNIDA CON SU FAMILIA!
            </h2>
            <p className="text-sm text-emerald-100 max-w-lg mx-auto">
              Gracias a la colaboración comunitaria de los vecinos de Trelew.
            </p>
          </div>
        ) : isLost ? (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
            <div className="flex items-center gap-2">
              <StatusBadge status={report.status} />
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                Perdido {formatTimeAgo(report.created_at || report.last_seen_date)}
              </span>
            </div>

            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900 px-3 py-1 rounded-full border border-rose-200/60 dark:border-rose-900/50">
              <Eye className="w-3.5 h-3.5 text-rose-500" />
              <span><strong>{viewsCount}</strong> personas vieron esta publicación</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                🟢 Mascota Encontrada
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {report.is_holding ? '🏠 En resguardo temporal' : '📍 Visto en la vía pública'}
              </span>
            </div>

            <span className="text-xs text-zinc-500">
              Encontrado {formatTimeAgo(report.created_at || report.found_date)}
            </span>
          </div>
        )}

        {/* Grid Principal: Foto + Datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Fotografía Principal con Lightbox al hacer Click */}
          <div className="space-y-4">
            <div 
              onClick={() => setLightboxOpen(true)}
              title="Hacé clic para ver la foto en pantalla completa"
              className="group relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 cursor-pointer"
            >
              <img
                src={photo}
                alt={petName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-black/75 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Ver foto completa</span>
                </div>
              </div>
            </div>

            {/* Acciones de Contacto Inmediato */}
            {!isReunited && (
              <div className="space-y-2.5">
                {isLost ? (
                  <>
                    <Link
                      href={`/publicar/avistamiento?reportId=${report.id}&petName=${encodeURIComponent(petName)}`}
                      className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-sm shadow-xl shadow-amber-400/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 border-2 border-amber-500 text-center"
                    >
                      <Eye className="w-5 h-5 text-zinc-950" />
                      ¿VISTE A {petName.toUpperCase()}? REPORTAR AVISTAMIENTO 🟡
                    </Link>

                    {report.profile?.phone && (
                      <a
                        href={`https://wa.me/${report.profile.phone.replace(/[^0-9]/g, '')}?text=Hola! Te escribo desde Mascotas Trelew por ${petName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Escribir por WhatsApp a la Familia ({report.profile.full_name || 'Dueño'})
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    {report.profile?.phone ? (
                      <a
                        href={`https://wa.me/${report.profile.phone.replace(/[^0-9]/g, '')}?text=Hola! Vi la publicación de la mascota encontrada en ${report.approximate_address}. Creo que es mía.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <MessageCircle className="w-5 h-5" />
                        ¡Es mi mascota! Contactar por WhatsApp
                      </a>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                        <p className="font-bold mb-1">🐾 Información de Resguardo</p>
                        <p>
                          {report.is_holding 
                            ? 'Esta mascota se encuentra resguardada temporalmente por un vecino de Trelew.' 
                            : 'Fue vista en la vía pública en la zona señalada en el mapa.'}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={handleShare}
                  className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir en Grupos de WhatsApp / Redes
                </button>
              </div>
            )}
          </div>

          {/* Información Detallada */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-black uppercase mb-2">
                {pet ? `${getSpeciesEmoji(pet.species)} ${capitalizeFirst(getSpeciesLabel(pet.species))}` : 'Mascota'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                {capitalizeWords(petName)}
              </h1>
              <p className="text-sm font-bold text-zinc-500 mt-0.5">
                {capitalizeWords(pet?.breed || 'Raza mestiza')} • {capitalizeWords(report.approximate_address)}
              </p>
            </div>

            {/* Ficha de Rasgos */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">Tamaño</span>
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                  {pet ? capitalizeFirst(getSizeLabel(pet.size)) : '-'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">Sexo</span>
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                  {pet ? capitalizeFirst(getGenderLabel(pet.gender)) : '-'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">Color Principal</span>
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                  {pet?.primary_color ? capitalizeWords(pet.primary_color) : '-'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase font-bold text-[10px]">{isLost ? 'Fecha de extravío' : 'Fecha de hallazgo'}</span>
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                  {formatDate(reportDate)}
                </span>
              </div>
            </div>

            {/* Detalles / Rasgos Particulares */}
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                Detalles / Rasgos Particulares
              </h4>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 bg-amber-50/80 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 leading-relaxed font-semibold">
                {capitalizeFirst(pet?.distinctive_features || report.description || 'Sin detalles adicionales especificados.')}
              </p>
            </div>

            {/* Ubicación */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
              <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-500" />
                {isLost ? 'Última Ubicación Conocida' : 'Lugar del Hallazgo'}
              </h4>
              <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                {capitalizeWords(report.approximate_address)}
              </p>
              {(() => {
                const parsed = parseGeoLocation(location);
                if (!parsed || typeof parsed.latitude !== 'number' || typeof parsed.longitude !== 'number') return null;
                return (
                  <p className="text-xs text-zinc-500 font-mono">
                    Coordenadas: {parsed.latitude.toFixed(4)}, {parsed.longitude.toFixed(4)}
                  </p>
                );
              })()}
            </div>

          </div>

        </div>

        {/* Línea Temporal de Avistamientos */}
        {isLost && (
          <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-500" />
                  Avistamientos Reportados ({sightings.length})
                </h3>
                <p className="text-xs text-zinc-500">
                  Puntos donde los vecinos informaron haber visto a {capitalizeWords(petName)}. Hacé click en cualquier avistamiento para ver su ficha completa.
                </p>
              </div>

              <Link
                href={`/publicar/avistamiento?reportId=${report.id}&petName=${encodeURIComponent(petName)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs shadow-xs transition-all active:scale-95 self-start sm:self-auto shrink-0 cursor-pointer"
              >
                <span>+ Aportar nuevo avistamiento</span>
              </Link>
            </div>

            {sightings.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm space-y-3">
                <p className="font-medium">
                  Aún no hay avistamientos registrados para {capitalizeWords(petName)}. Si la viste en la calle, podés informar la hora y lugar para orientar la búsqueda de la familia.
                </p>
                <Link
                  href={`/publicar/avistamiento?reportId=${report.id}&petName=${encodeURIComponent(petName)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs shadow-md transition-all active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>¿La viste? Reportar dónde fue</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {sightings.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/mascota-avistada/${s.id}`}
                    className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 border-2 border-amber-200/90 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-600 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {s.photo_url ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-amber-200 dark:border-amber-800 bg-zinc-100">
                          <img 
                            src={s.photo_url} 
                            alt="Foto avistamiento" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-2xl shrink-0">
                          🟡
                        </div>
                      )}

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Avistamiento
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">
                            • {formatTimeAgo(s.sighting_date)}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          📍 {capitalizeWords(s.approximate_address)}
                        </h4>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {capitalizeFirst(s.description)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform self-end sm:self-center shrink-0">
                      <span>Ver Ficha</span>
                      <span>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prevención de Fraude y Seguridad */}
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Prevención de Estafas</strong>: Nunca realices transferencias de dinero por adelantado ni entregues datos bancarios.
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL / LIGHTBOX DE FOTO COMPLETA                                         */}
      {/* ========================================================================= */}
      {lightboxOpen && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar foto"
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={photo}
              alt={petName}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white text-sm font-bold mt-3 text-center">
              🐾 {petName} — {report.approximate_address}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE GENERACIÓN DE CARTEL A4                                          */}
      {/* ========================================================================= */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-red-600" />
                Cartel Oficial de Búsqueda A4
              </h3>
              <button
                onClick={() => setShowPosterModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Al hacer clic en &quot;Imprimir ahora&quot;, el navegador imprimirá <strong>únicamente el cartel</strong> limpio listo para pegar en comercios o postes.
            </p>

            <div className="border-2 border-dashed border-red-500 rounded-2xl p-4 bg-zinc-50 text-center space-y-3">
              <span className="text-xs font-black text-red-600 uppercase tracking-widest block">SE BUSCA A</span>
              <h2 className="text-2xl font-black text-zinc-950 uppercase">{petName}</h2>
              <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden border border-zinc-300">
                <img src={photo} alt={petName} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-semibold text-zinc-700">Zona: {report.approximate_address}</p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowPosterModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handlePrintPoster}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Imprimir Cartel A4
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA DEDICADA EXCLUSIVA PARA IMPRESIÓN A4 (@media print)                 */}
      {/* ========================================================================= */}
      <div className="hidden print:block font-sans text-black p-4 max-w-2xl mx-auto space-y-4 text-center">
        <div className="border-8 border-red-700 p-6 rounded-2xl space-y-4">
          <div className="bg-red-700 text-white py-2 px-4 rounded-lg">
            <h1 className="text-4xl font-black uppercase tracking-tight">¡SE BUSCA!</h1>
            <p className="text-sm font-bold uppercase tracking-widest">Mascota Extraviada en Trelew</p>
          </div>

          <h2 className="text-5xl font-black text-black uppercase tracking-tight py-1">
            {petName}
          </h2>

          <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden border-4 border-black">
            <img src={photo} alt={petName} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-left bg-zinc-100 p-3 rounded-xl border border-zinc-300 text-sm">
            <div>
              <strong>Especie:</strong> {pet ? getSpeciesLabel(pet.species).toUpperCase() : 'PERRO'}
            </div>
            <div>
              <strong>Color:</strong> {pet?.primary_color ? pet.primary_color.toUpperCase() : 'NO ESPECIFICADO'}
            </div>
            <div className="col-span-2">
              <strong>Zona donde se perdió:</strong> {report.approximate_address.toUpperCase()}
            </div>
            {(pet?.distinctive_features || report.description) && (
              <div className="col-span-2">
                <strong>Rasgos Particulares:</strong> {(pet?.distinctive_features || report.description).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex items-center justify-around gap-4 pt-2 border-t-2 border-zinc-200">
            {posterQrUrl && (
              <div className="text-center">
                <img src={posterQrUrl} alt="QR Ficha" className="w-32 h-32 mx-auto border-2 border-black rounded-lg" />
                <span className="text-[10px] font-mono font-bold mt-1 block">ESCANEAR PARA AVISAR</span>
              </div>
            )}

            <div className="text-left space-y-1">
              <span className="text-xs font-bold text-zinc-600 block uppercase">Teléfono de Contacto:</span>
              <p className="text-2xl font-black text-red-700">
                {report.profile?.phone || 'Ver en la web'}
              </p>
              <p className="text-xs font-bold text-zinc-800">
                mascotastrelew.com.ar
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
