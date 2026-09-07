'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Printer, Download, MapPin, Sparkles } from 'lucide-react';

export default function CartelesQRPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [campaign, setCampaign] = useState('Veterinarias Trelew');
  const [targetType, setTargetType] = useState('general');

  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetUrl = targetType === 'general'
      ? `${window.location.origin}/publicar/perdida`
      : `${window.location.origin}/mapa`;

    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#ea580c', // Orange-600
        light: '#ffffff',
      },
    }).then(setQrDataUrl);
  }, [targetType]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase mb-1">
            <QrCode className="w-3.5 h-3.5" />
            Estrategia de Difusión Física
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Generador de Carteles QR Comunitarios
          </h1>
          <p className="text-sm text-zinc-500">
            Imprimí carteles oficiales para colocar en veterinarias, pet shops, plazas y comercios de Trelew.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Imprimir Cartel A4
        </button>
      </div>

      {/* Controles del Cartel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-xs">
        <div>
          <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Destino del Código QR:
          </label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="w-full p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer"
          >
            <option value="general">Publicar Mascota Perdida Express (/publicar/perdida)</option>
            <option value="mapa">Ver Mapa en Vivo de Trelew (/mapa)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Ubicación / Campaña Asignada:
          </label>
          <input
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="Ej: Veterinaria Patagonia / Plaza Independencia"
            className="w-full p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-semibold"
          />
        </div>
      </div>

      {/* Preview del Cartel Imprimible A4 */}
      <div
        ref={posterRef}
        className="max-w-md mx-auto bg-white text-zinc-950 p-8 rounded-3xl border-4 border-dashed border-orange-500 shadow-2xl text-center space-y-5 print:border-none print:shadow-none print:m-0"
      >
        <div className="space-y-1">
          <span className="text-5xl">🐾</span>
          <h2 className="text-3xl font-black tracking-tight text-orange-600 uppercase">
            ¿Perdiste a tu Mascota?
          </h2>
          <p className="text-sm font-extrabold text-zinc-700 uppercase tracking-wide">
            Red Comunitaria de Trelew
          </p>
        </div>

        <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
          <p className="text-xs font-bold text-orange-900 leading-snug">
            Publicala GRATIS en menos de 60 segundos o informá un avistamiento para ayudar a un vecino.
          </p>
        </div>

        {/* Imagen del Código QR */}
        {qrDataUrl && (
          <div className="inline-block p-4 bg-white rounded-2xl shadow-md border-2 border-orange-500">
            <img src={qrDataUrl} alt="Código QR Comunitario" className="w-56 h-56 mx-auto" />
            <span className="block text-[11px] font-mono font-bold text-zinc-600 mt-2">
              ESCANEA CON LA CÁMARA
            </span>
          </div>
        )}

        <div className="space-y-1 pt-2 border-t-2 border-zinc-100">
          <p className="text-xs font-bold text-zinc-800">
            mascotastrelew.com.ar
          </p>
          <p className="text-[10px] text-zinc-500">
            Campaña oficial comunitaria • Trelew, Chubut
          </p>
        </div>
      </div>

    </div>
  );
}
