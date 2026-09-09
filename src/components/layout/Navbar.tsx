'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  PlusCircle, 
  MapPin, 
  ShieldCheck, 
  Menu, 
  X,
  Compass,
  FileText,
  HeartHandshake
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Trelew');

  const navLinks = [
    { href: '/mapa', label: 'Mapa Interactivo', icon: Compass },
    { href: '/publicar/perdida', label: 'Perdí mi mascota', icon: PlusCircle, highlight: 'lost' },
    { href: '/publicar/encontrada', label: 'Encontré una mascota', icon: HeartHandshake, highlight: 'found' },
    { href: '/mis-reportes', label: 'Mis Reportes', icon: FileText },
    { href: '/admin', label: 'Panel Moderador', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-3">
            <Link id="tour-brand" href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🐾</span>
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                  Mascotas<span className="text-orange-600 dark:text-orange-500">Trelew</span>
                </span>
                <span className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Red Comunitaria
                </span>
              </div>
            </Link>

            {/* Selector de Ciudad */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none focus:outline-none cursor-pointer pr-1"
              >
                <option value="Trelew">Trelew</option>
                <option value="Rawson">Rawson</option>
                <option value="Playa Unión">Playa Unión</option>
                <option value="Puerto Madryn">Puerto Madryn</option>
                <option value="Gaiman">Gaiman</option>
              </select>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/mapa"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/mapa'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900'
              )}
            >
              <Compass className="w-4 h-4 text-orange-500" />
              Mapa
            </Link>

            <Link
              href="/publicar/perdida"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Perdí mi mascota
            </Link>

            <Link
              href="/publicar/encontrada"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              Encontré / Vi una mascota
            </Link>

            <Link
              id="tour-nav-my-reports"
              href="/mis-reportes"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/mis-reportes'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              )}
            >
              Mis Reportes
            </Link>

            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                pathname === '/admin'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200'
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Super Admin
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/publicar/perdida"
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-rose-600 text-white shadow-xs"
            >
              Perdí
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="py-2 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Ciudad de búsqueda:</span>
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">📍 {selectedCity}</span>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  pathname === link.href
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-orange-600 dark:text-orange-400'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                )}
              >
                <Icon className="w-5 h-5 text-zinc-500" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
