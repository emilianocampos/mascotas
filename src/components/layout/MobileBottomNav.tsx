'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, HeartHandshake, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/publicar/perdida', label: 'Perdí', icon: PlusCircle },
    { href: '/mapa', label: 'Mapa', icon: Compass, isMain: true },
    { href: '/publicar/encontrada', label: 'Encontré / Vi', icon: HeartHandshake },
    { href: '/mis-reportes', label: 'Mis Reportes', icon: FileText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 group"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/35 ring-4 ring-white dark:ring-zinc-950 group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center transition-colors',
                isActive
                  ? 'text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
