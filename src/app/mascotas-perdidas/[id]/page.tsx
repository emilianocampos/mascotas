import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUnifiedReportById, getSightingsForReport } from '@/services/reports.service';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  formatDistance, 
  formatTimeAgo, 
  formatDate, 
  getSpeciesEmoji, 
  getSpeciesLabel, 
  getSizeLabel, 
  getGenderLabel,
  parseGeoLocation
} from '@/lib/utils';
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Share2, 
  Eye, 
  AlertTriangle, 
  Heart,
  ChevronLeft,
  CheckCircle2,
  ShieldAlert,
  Home
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

// Generación de Metadatos Dinámicos Open Graph para WhatsApp y Facebook
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const report = await getUnifiedReportById(id);

  if (!report) {
    return { title: 'Mascota no encontrada — Mascotas Trelew' };
  }

  const isLost = report.report_type === 'lost';
  const name = report.pet?.name || (isLost ? 'Mascota perdida' : 'Mascota encontrada');
  const species = report.pet ? getSpeciesLabel(report.pet.species) : 'Mascota';
  
  const title = isLost 
    ? `🚨 BUSCAMOS A ${name.toUpperCase()} (${species}) en ${report.approximate_address}`
    : `🟢 MASCOTA ENCONTRADA (${species}) en ${report.approximate_address}`;

  const description = report.description || `Ayudanos a reunirla con su familia en Trelew.`;
  const image = report.pet?.photos?.[0] || 'https://images.unsplash.com/photo-1552053831-71594a27632d';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 800, height: 600, alt: name }],
      type: 'article',
    },
  };
}

export default async function DetalleMascotaPage({ params }: Props) {
  const { id } = await params;
  const report = await getUnifiedReportById(id);

  if (!report) {
    notFound();
  }

  const isLost = report.report_type === 'lost';
  const isReunited = report.status === 'REUNITED';
  const pet = report.pet;
  const petName = pet?.name || (isLost ? 'Mascota perdida' : 'Mascota encontrada');
  const reportDate = isLost ? report.last_seen_date : report.found_date;
  const location = isLost ? report.last_seen_location : report.found_location;

  const sightings = isLost ? await getSightingsForReport(id) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Volver */}
      <div className="flex items-center justify-between">
        <Link
          href="/mapa"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al mapa
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Inicio
        </Link>
      </div>

      {/* Cartel Principal / Banner de Estado */}
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
              Perdido {formatTimeAgo(report.last_seen_date)}
            </span>
          </div>

          <div className="text-xs text-zinc-500">
            👀 {report.views_count || 0} personas vieron esta publicación
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
            Encontrado {formatTimeAgo(report.found_date)}
          </span>
        </div>
      )}

      {/* Grid Principal: Foto + Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Fotografía Principal */}
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
            <img
              src={pet?.photos?.[0] || 'https://images.unsplash.com/photo-1552053831-71594a27632d'}
              alt={petName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Acciones de Contacto Inmediato */}
          {!isReunited && (
            <div className="space-y-2.5">
              {isLost ? (
                <>
                  <Link
                    href={`/publicar/avistamiento`}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Eye className="w-5 h-5" />
                    ¿VISTE A {petName.toUpperCase()}? REPORTAR AVISTAMIENTO
                  </Link>

                  {report.profile?.phone && (
                    <a
                      href={`https://wa.me/${report.profile.phone.replace(/[^0-9]/g, '')}?text=Hola! Te escribo desde la plataforma de Mascotas Trelew por ${petName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Escribir por WhatsApp a la Familia ({report.profile.full_name})
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
            </div>
          )}
        </div>

        {/* Información Detallada */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase mb-2">
              {pet ? `${getSpeciesEmoji(pet.species)} ${getSpeciesLabel(pet.species)}` : 'Mascota'}
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
              {petName}
            </h1>
            <p className="text-sm font-semibold text-zinc-500 mt-0.5">
              {pet?.breed || 'Raza mestiza'} • {report.approximate_address}
            </p>
          </div>

          {/* Ficha de Rasgos */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 block">Tamaño</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {pet ? getSizeLabel(pet.size) : '-'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Sexo</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {pet ? getGenderLabel(pet.gender) : '-'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Color Principal</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {pet?.primary_color || '-'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">{isLost ? 'Fecha de extravío' : 'Fecha de hallazgo'}</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {formatDate(reportDate)}
              </span>
            </div>
          </div>

          {/* Rasgos distintivos */}
          {pet?.distinctive_features && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                Rasgos Particulares
              </h4>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                {pet.distinctive_features}
              </p>
            </div>
          )}

          {/* Descripción */}
          {report.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                {isLost ? 'Cómo se extravió' : 'Descripción del hallazgo'}
              </h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {report.description}
              </p>
            </div>
          )}

          {/* Ubicación */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-500" />
              {isLost ? 'Última Ubicación Conocida' : 'Lugar del Hallazgo'}
            </h4>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {report.approximate_address}
            </p>
            {(() => {
              const parsed = parseGeoLocation(location);
              if (!parsed || typeof parsed.latitude !== 'number' || typeof parsed.longitude !== 'number') return null;
              return (
                <p className="text-xs text-zinc-500">
                  Coordenadas: {parsed.latitude.toFixed(4)}, {parsed.longitude.toFixed(4)}
                </p>
              );
            })()}
          </div>

        </div>

      </div>

      {/* Línea Temporal de Avistamientos (Solo para mascotas perdidas) */}
      {isLost && (
        <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                Avistamientos Reportados ({sightings.length})
              </h3>
              <p className="text-xs text-zinc-500">
                Puntos donde los vecinos informaron haber visto a un animal con características similares.
              </p>
            </div>

            <Link
              href="/publicar/avistamiento"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              + Aportar nuevo avistamiento
            </Link>
          </div>

          {sightings.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm">
              Aún no hay avistamientos registrados para esta mascota. Si la viste en la calle, podés informar la hora y lugar para ayudar a orientar la búsqueda.
            </div>
          ) : (
            <div className="space-y-3">
              {sightings.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 shadow-xs flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {s.approximate_address}
                      </span>
                      <span className="text-xs text-zinc-400">
                        • {formatTimeAgo(s.sighting_date)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {s.description}
                    </p>
                  </div>

                  {s.photo_url && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                      <img src={s.photo_url} alt="Foto avistamiento" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
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
            <strong>Prevención de Estafas</strong>: Nunca realices transferencias de dinero por adelantado por recompensas ni entregues datos bancarios.
          </span>
        </div>
      </div>

      {/* Barra Flotante Inferior de Contacto para Celulares */}
      {!isReunited && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 z-40 shadow-2xl flex items-center gap-2">
          {isLost ? (
            <>
              <Link
                href="/publicar/avistamiento"
                className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                <Eye className="w-4 h-4" />
                Vi a {petName}
              </Link>
              {report.profile?.phone && (
                <a
                  href={`https://wa.me/${report.profile.phone.replace(/[^0-9]/g, '')}?text=Hola! Te escribo por ${petName} desde Mascotas Trelew`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </>
          ) : (
            report.profile?.phone && (
              <a
                href={`https://wa.me/${report.profile.phone.replace(/[^0-9]/g, '')}?text=Hola! Vi la mascota encontrada en ${report.approximate_address}. Creo que es mía.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                <MessageCircle className="w-4 h-4" />
                ¡Es mi mascota! Contactar por WhatsApp
              </a>
            )
          )}
        </div>
      )}

    </div>
  );
}
