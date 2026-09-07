import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PetSpecies, PetSize, PetGender, ReportStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(meters?: number | null): string {
  if (meters === undefined || meters === null) return '';
  if (meters < 1000) {
    return `a ${Math.round(meters)} m`;
  }
  return `a ${(meters / 1000).toFixed(1)} km`;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getSpeciesLabel(species: PetSpecies): string {
  const labels: Record<PetSpecies, string> = {
    dog: 'Perro',
    cat: 'Gato',
    bird: 'Ave',
    rabbit: 'Conejo',
    other: 'Otro animal',
  };
  return labels[species] || 'Animal';
}

export function getSpeciesEmoji(species: PetSpecies): string {
  const emojis: Record<PetSpecies, string> = {
    dog: '🐕',
    cat: '🐈',
    bird: '🦜',
    rabbit: '🐇',
    other: '🐾',
  };
  return emojis[species] || '🐾';
}

export function getSizeLabel(size: PetSize): string {
  const labels: Record<PetSize, string> = {
    small: 'Pequeño (hasta 10kg)',
    medium: 'Mediano (10 a 25kg)',
    large: 'Grande (25 a 40kg)',
    giant: 'Gigante (+40kg)',
  };
  return labels[size] || size;
}

export function getGenderLabel(gender: PetGender): string {
  const labels: Record<PetGender, string> = {
    male: 'Macho',
    female: 'Hembra',
    unknown: 'No estoy seguro / Desconocido',
  };
  return labels[gender] || gender;
}

export function getStatusBadge(status: ReportStatus): { label: string; colorClass: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'BÚSQUEDA ACTIVA', colorClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' };
    case 'REUNITED':
      return { label: '¡REUNIDO EN CASA! ❤️', colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold' };
    case 'FOUND':
      return { label: 'ENCONTRADO / EN TRÁNSITO', colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
    case 'UNDER_REVIEW':
      return { label: 'EN REVISIÓN', colorClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' };
    case 'CLOSED':
      return { label: 'CERRADO', colorClass: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20' };
    case 'REMOVED':
      return { label: 'ELIMINADO', colorClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' };
    default:
      return { label: status, colorClass: 'bg-slate-500/10 text-slate-700 border-slate-500/20' };
  }
}

export function parseGeoLocation(loc: any): { latitude: number; longitude: number } | null {
  if (!loc) return null;
  if (typeof loc === 'object' && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
    return { latitude: loc.latitude, longitude: loc.longitude };
  }
  if (typeof loc === 'object' && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    return { latitude: Number(loc.coordinates[1]), longitude: Number(loc.coordinates[0]) };
  }
  if (typeof loc === 'string') {
    const match = loc.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (match) {
      return { latitude: parseFloat(match[2]), longitude: parseFloat(match[1]) };
    }
  }
  return null;
}
