'use client';

import React, { useEffect, useState } from 'react';

interface CapybaraLoaderProps {
  onFinish?: () => void;
}

export function CapybaraLoader({ onFinish }: CapybaraLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // 1.1s de animación del carpincho en pantalla completa
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 1100);

    // Desmontar completamente del DOM tras la transición de desvanecimiento
    const removeTimer = setTimeout(() => {
      setMounted(false);
    }, 1600);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen min-h-dvh flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 select-none transition-all duration-500 ease-out ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-98 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      <div className="flex flex-col items-center justify-center gap-5">
        {/* Capybara Loader animation */}
        <div className="capybaraloader">
          <div className="capybara">
            <div className="capyhead">
              <div className="capyear">
                <div className="capyear2"></div>
              </div>
              <div className="capyear"></div>
              <div className="capymouth">
                <div className="capylips"></div>
                <div className="capylips"></div>
              </div>
              <div className="capyeye"></div>
              <div className="capyeye"></div>
            </div>
            <div className="capyleg"></div>
            <div className="capyleg2"></div>
            <div className="capyleg2"></div>
            <div className="capy"></div>
          </div>
          <div className="loader">
            <div className="loaderline"></div>
          </div>
        </div>

        <p className="text-sm font-black tracking-wider text-amber-900/80 dark:text-amber-200/80 uppercase animate-pulse">
          Mascotas Trelew
        </p>
      </div>
    </div>
  );
}
