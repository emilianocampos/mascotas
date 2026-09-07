'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUploader from '@/components/forms/PhotoUploader';
import LocationPicker from '@/components/map/LocationPicker';
import { sightingSchema, SightingInput } from '@/lib/validations/sighting.schema';
import { Eye, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { createSightingInDb } from '@/services/reports.service';

export default function PublicarAvistamientoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<SightingInput> & { photos?: string[] }>({
    lost_report_id: '11111111-1111-1111-1111-111111111111',
    latitude: -43.25150,
    longitude: -65.30800,
    sighting_date: new Date().toISOString().slice(0, 16),
    approximate_address: 'Calle Mitre y Rawson, Trelew',
    photos: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const formattedAddress = formData.neighborhood?.trim()
      ? `${formData.approximate_address?.trim() || ''}, B° ${formData.neighborhood.trim().replace(/^b[°ºa-z.]*\s*/i, '')}`
      : (formData.approximate_address || '');

    const payload: SightingInput = {
      lost_report_id: formData.lost_report_id || '11111111-1111-1111-1111-111111111111',
      latitude: formData.latitude || -43.24895,
      longitude: formData.longitude || -65.30505,
      approximate_address: formattedAddress,
      sighting_date: formData.sighting_date || new Date().toISOString(),
      photo_url: formData.photos?.[0] || null,
      description: formData.description || '',
      reporter_name: formData.reporter_name || 'Vecino anónimo',
    };

    const validation = sightingSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setFormErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createSightingInDb(validation.data);
      setIsSubmitting(false);
      setSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Error al registrar avistamiento: ${err.message || 'Verificá tu conexión a Supabase'}`);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            ¡Avistamiento Registrado! 🟡
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tu reporte fue agregado a la línea temporal y el mapa de búsqueda. ¡Muchas gracias por colaborar!
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.push('/mapa')}
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Ver en el Mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Avistamiento Express
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          Vi una mascota perdida
        </h1>
        <p className="text-sm text-zinc-500">
          ¿Viste a un perro o gato deambulando en la calle? Registrá la hora y lugar para ayudar a reconstruir su camino.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Foto rápida */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <PhotoUploader
            photos={formData.photos || []}
            onChange={(photos) => setFormData({ ...formData, photos })}
            label="Foto del avistamiento (opcional pero muy útil)"
            helperText="Si pudiste tomarle una foto rápida en la calle, subila acá."
          />
        </div>

        {/* Lugar y Dirección */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            ¿Dónde y hacia dónde iba?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Calle o Esquina <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: San Martín o 25 de Mayo y Pellegrini"
                value={formData.street_name || formData.approximate_address || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    street_name: val,
                    approximate_address: val,
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                N° de calle <span className="text-zinc-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: 450 o s/n"
                value={formData.street_number || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, street_number: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Barrio <span className="text-zinc-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Padre Juan, Centro..."
                value={formData.neighborhood || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, neighborhood: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Fecha y Hora <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
                  setFormData((prev) => ({ ...prev, sighting_date: localIso }));
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer"
              >
                <Clock className="w-3 h-3" />
                Poner actual
              </button>
            </div>
            <input
              type="datetime-local"
              value={formData.sighting_date || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, sighting_date: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Detalle del avistamiento <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Iba trotando en dirección a la Laguna Chiquichano, se veía cansado pero en buen estado..."
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none"
            />
          </div>

          <LocationPicker
            initialLat={formData.latitude}
            initialLng={formData.longitude}
            onLocationChange={(lat, lng, address) => {
              setFormData((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                ...(address ? { approximate_address: address } : {}),
              }));
            }}
            label="Punto en el mapa de Trelew"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Enviando...' : 'REGISTRAR AVISTAMIENTO 🟡'}
        </button>

      </form>
    </div>
  );
}
