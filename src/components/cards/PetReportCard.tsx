'use client';

import React from 'react';
import Link from 'next/link';
import { LostReport, FoundReport } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDistance, formatTimeAgo, getSpeciesEmoji, getSpeciesLabel, getSizeLabel } from '@/lib/utils';
import { MapPin, Clock, Share2, Phone, MessageCircle } from 'lucide-react';

interface PetReportCardProps {
  report: LostReport | FoundReport;
  type: 'lost' | 'found';
}

export function PetReportCard({ report, type }: PetReportCardProps) {
  const isLost = type === 'lost';
  const lostRep = isLost ? (report as LostReport) : null;
  const foundRep = !isLost ? (report as FoundReport) : null;

  const petName = report.pet?.name || (isLost ? 'Mascota perdida' : 'Mascota encontrada');
  const photo = report.pet?.photos?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';
  const dateStr = isLost ? lostRep!.last_seen_date : foundRep!.found_date;
  const species = report.pet?.species || 'dog';

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/mascotas-perdidas/${report.id}`;
    if (navigator.share) {
      navigator.share({
        title: `🐾 ${petName} en ${report.approximate_address}`,
        text: `Ayudanos a difundir: ${report.description}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Enlace copiado al portapapeles para compartir en WhatsApp o Facebook!');
    }
  };

  return (
    <Link
      href={`/mascotas-perdidas/${report.id}`}
      className="group block bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-xl hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={photo}
          alt={petName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          <StatusBadge status={report.status} />
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
            <span>{getSpeciesEmoji(species)}</span>
            <span>{getSpeciesLabel(species)}</span>
          </span>
        </div>

        {/* Distance Badge */}
        {report.distance_meters !== undefined && (
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-orange-600 text-white font-bold text-xs shadow-md flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {formatDistance(report.distance_meters)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors line-clamp-1">
            {petName}
          </h3>
          <button
            onClick={handleShare}
            aria-label="Compartir publicación"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Location & Time */}
        <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{report.approximate_address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{formatTimeAgo(dateStr)}</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed pt-1 border-t border-zinc-100 dark:border-zinc-800">
          {report.description}
        </p>
      </div>
    </Link>
  );
}
