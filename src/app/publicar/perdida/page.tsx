'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUploader from '@/components/forms/PhotoUploader';
import LocationPicker from '@/components/map/LocationPicker';
import { lostReportSchema, LostReportInput } from '@/lib/validations/lost-report.schema';
import { PetSpecies, PetSize, PetGender } from '@/types';
import { PlusCircle, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { createLostReportInDb } from '@/services/reports.service';

const FRIENDLY_LOST_LABELS: Record<string, string> = {
  name: 'Nombre de la mascota',
  species: 'Tipo de animal',
  size: 'Tamaño aproximado',
  primary_color: 'Color principal',
  photos: 'Fotografía de la mascota',
  approximate_address: 'Barrio, plaza o calle',
  last_seen_date: 'Fecha y hora',
  description: 'Descripción de cómo se extravió',
  contact_name: 'Tu nombre',
  contact_phone: 'Teléfono o WhatsApp',
};

export default function PublicarPerdidaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<LostReportInput>>({
    species: 'dog',
    gender: 'unknown',
    size: 'medium',
    photos: [],
    latitude: -43.24895,
    longitude: -65.30505,
    last_seen_date: new Date().toISOString().slice(0, 16),
    contact_phone_public: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validar con Zod
    const validation = lostReportSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const fieldName = err.path[0]?.toString() || 'campo';
        let msg = err.message;
        if (msg.includes('expected string') || msg.includes('Invalid input')) {
          msg = `Por favor completá el campo: ${FRIENDLY_LOST_LABELS[fieldName] || fieldName}`;
        }
        fieldErrors[fieldName] = msg;
      });
      setFormErrors(fieldErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Inserción real en PostgreSQL / Supabase
      const newId = await createLostReportInDb(validation.data);
      setIsSubmitting(false);
      setSuccessId(newId);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Error al guardar en base de datos: ${err.message || 'Verificá tu conexión a Supabase'}`);
    }
  };

  if (successId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            ¡Publicación creada exitosamente! ❤️
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tu reporte ya está activo en el mapa de Trelew. Ahora la comunidad puede ayudarte a encontrarla.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => {
              const url = `${window.location.origin}/mascotas-perdidas/${successId}`;
              if (navigator.share) {
                navigator.share({
                  title: `🐾 Mascota perdida en Trelew`,
                  text: `Ayudanos a buscar a ${formData.name}. Compartí en grupos de WhatsApp o Facebook:`,
                  url,
                });
              } else {
                navigator.clipboard.writeText(url);
                alert('¡Enlace copiado al portapapeles!');
              }
            }}
            className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            📢 Compartir en WhatsApp / Facebook
          </button>

          <button
            onClick={() => router.push(`/mascotas-perdidas/${successId}`)}
            className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-sm transition-all"
          >
            Ver Ficha Pública
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Alerta Inmediata
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          Perdí a mi mascota
        </h1>
        <p className="text-sm text-zinc-500">
          Completá estos datos básicos para activar la búsqueda en el mapa de Trelew.
        </p>
      </div>

      {Object.keys(formErrors).length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs space-y-1">
          <p className="font-bold">Por favor completá los siguientes campos requeridos:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.values(formErrors).map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. FOTO */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <PhotoUploader
            photos={formData.photos || []}
            onChange={(photos) => setFormData({ ...formData, photos })}
            helperText="Subí una foto donde se vea su carita y cuerpo completo."
          />
        </div>

        {/* 2. DATOS DE LA MASCOTA */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            1. Datos de la mascota
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre de la mascota <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Toby, Luna, Mishi"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Especie <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value as PetSpecies })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="dog">Perro 🐕</option>
                <option value="cat">Gato 🐈</option>
                <option value="bird">Ave 🦜</option>
                <option value="rabbit">Conejo 🐇</option>
                <option value="other">Otro animal 🐾</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Tamaño <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value as PetSize })}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none cursor-pointer"
              >
                <option value="small">Chico (-10kg)</option>
                <option value="medium">Mediano (10-25kg)</option>
                <option value="large">Grande (25-40kg)</option>
                <option value="giant">Gigante (+40kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Color Principal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Negro, Marrón, Blanco"
                value={formData.primary_color || ''}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Sexo
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as PetGender })}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none cursor-pointer"
              >
                <option value="male">Macho</option>
                <option value="female">Hembra</option>
                <option value="unknown">No especificado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Descripción / Rasgos particulares
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Llevaba collar rojo sin chapita, tiene una manchita blanca en el pecho, renguea un poco..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* 3. UBICACIÓN Y FECHA */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            2. ¿Dónde y cuándo la viste por última vez?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Barrio o Dirección aproximada <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: B° Los Aromos, cerca de la plaza"
                value={formData.approximate_address || ''}
                onChange={(e) => setFormData({ ...formData, approximate_address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Fecha y hora aproximada <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.last_seen_date || ''}
                onChange={(e) => setFormData({ ...formData, last_seen_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <LocationPicker
            initialLat={formData.latitude}
            initialLng={formData.longitude}
            onLocationChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
            label="Marcar punto en el mapa de Trelew"
          />
        </div>

        {/* 4. CONTACTO */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            3. Medio de Contacto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Tu Nombre o Apodo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Laura"
                value={formData.contact_name || ''}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Teléfono / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Ej: 280 412-3456"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base shadow-lg shadow-rose-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Publicando en el mapa...</span>
          ) : (
            <>
              <span>ACTIVAR BÚSQUEDA AHORA</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </form>

    </div>
  );
}
