'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUploader from '@/components/forms/PhotoUploader';
import LocationPicker from '@/components/map/LocationPicker';
import AddressAutocomplete from '@/components/forms/AddressAutocomplete';
import { foundReportSchema, FoundReportInput } from '@/lib/validations/found-report.schema';
import { PetSpecies, PetSize, PetGender } from '@/types';
import { HeartHandshake, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { createFoundReportInDb } from '@/services/reports.service';

const FRIENDLY_LABELS: Record<string, string> = {
  species: 'Tipo de animal',
  size: 'Tamaño aproximado',
  primary_color: 'Color principal',
  photos: 'Fotografía de la mascota',
  approximate_address: 'Calle o barrio donde fue visto',
  found_date: 'Fecha y hora',
  description: 'Descripción general',
  contact_name: 'Tu nombre',
  contact_phone: 'Teléfono o WhatsApp',
  is_holding: 'Lugar donde se encuentra el animal',
};

export default function PublicarEncontradaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<FoundReportInput>>({
    species: 'dog',
    gender: 'unknown',
    size: 'small',
    photos: [],
    latitude: -43.24895,
    longitude: -65.30505,
    found_date: new Date().toISOString().slice(0, 16),
    is_holding: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = foundReportSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const fieldName = err.path[0]?.toString() || 'campo';
        let msg = err.message;
        if (msg.includes('expected string') || msg.includes('Invalid input')) {
          msg = `Por favor completá el campo: ${FRIENDLY_LABELS[fieldName] || fieldName}`;
        }
        fieldErrors[fieldName] = msg;
      });
      setFormErrors(fieldErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = await createFoundReportInDb(validation.data);
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
            ¡Mascota registrada correctamente! 💚
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            El sistema ya está cruzando esta publicación con las mascotas perdidas reportadas en Trelew.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => router.push('/mapa')}
            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Rescate / Hallazgo
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          Encontré una mascota
        </h1>
        <p className="text-sm text-zinc-500">
          Publicá una foto y el lugar para encontrar a su familia lo antes posible.
        </p>
      </div>

      {Object.keys(formErrors).length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs space-y-1">
          <p className="font-bold">Revisá los siguientes campos:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.values(formErrors).map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Foto */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <PhotoUploader
            photos={formData.photos || []}
            onChange={(photos) => setFormData({ ...formData, photos })}
            label="Foto del animal encontrado"
            helperText="Una foto clara es el factor #1 para que el dueño lo reconozca."
          />
        </div>

        {/* Datos y Situación de Tránsito */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            1. ¿Dónde está el animal ahora?
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-colors">
              <input
                type="radio"
                name="is_holding"
                checked={formData.is_holding === true}
                onChange={() => setFormData({ ...formData, is_holding: true })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                  Lo tengo en tránsito en mi casa / patio 🏠
                </span>
                <span className="text-xs text-zinc-500">
                  El animal está a salvo esperando que aparezca su dueño.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-colors">
              <input
                type="radio"
                name="is_holding"
                checked={formData.is_holding === false}
                onChange={() => setFormData({ ...formData, is_holding: false })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                  Quedó en la vía pública / no pude retenerlo 🐾
                </span>
                <span className="text-xs text-zinc-500">
                  Fue visto deambulando en el lugar indicado abajo.
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Especie <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.species}
                onChange={(e) => setFormData((prev) => ({ ...prev, species: e.target.value as PetSpecies }))}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none cursor-pointer"
              >
                <option value="dog">Perro 🐕</option>
                <option value="cat">Gato 🐈</option>
                <option value="bird">Ave 🦜</option>
                <option value="rabbit">Conejo 🐇</option>
                <option value="other">Otro animal 🐾</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Color Principal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Blanco con manchas"
                value={formData.primary_color || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Tamaño <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData((prev) => ({ ...prev, size: e.target.value as PetSize }))}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none cursor-pointer"
              >
                <option value="small">Chico (-10kg)</option>
                <option value="medium">Mediano (10-25kg)</option>
                <option value="large">Grande (25-40kg)</option>
                <option value="giant">Gigante (+40kg)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Descripción general / Estado del animal <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Tenía collar verde, parece bien cuidado y es muy cariñoso. Lo tengo alimentado y protegido..."
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            2. ¿Dónde lo encontraste?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AddressAutocomplete
              value={formData.approximate_address || ''}
              onChange={(address, coords) => {
                setFormData((prev) => ({
                  ...prev,
                  approximate_address: address,
                  ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
                }));
              }}
              label="Esquina, Calle o Barrio"
              placeholder="Ej: San Martín 450 o Conesa"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Fecha y hora del hallazgo <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
                    setFormData((prev) => ({ ...prev, found_date: localIso }));
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
                >
                  <Clock className="w-3 h-3" />
                  Poner fecha y hora actual
                </button>
              </div>
              <input
                type="datetime-local"
                value={formData.found_date || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, found_date: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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
            label="Marcar lugar del hallazgo"
          />
        </div>

        {/* Contacto */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            3. Tu Contacto para que el dueño te escriba
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Tu Nombre <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Lucía"
                value={formData.contact_name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, contact_name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Teléfono / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Ej: 280 499-8877"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Registrando...' : 'PUBLICAR MASCOTA ENCONTRADA 💚'}
        </button>

      </form>
    </div>
  );
}
