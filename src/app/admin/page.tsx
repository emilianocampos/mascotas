'use client';

import React, { useEffect, useState } from 'react';
import { getAdminStats } from '@/services/reports.service';
import { AdminDashboardStats } from '@/types';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff,
  LogOut,
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Sparkles 
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth') === 'true';
    setIsAuthenticated(isAuth);
    if (isAuth) {
      getAdminStats().then(setStats);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoadingLogin(true);

    setTimeout(() => {
      if (username.trim() === 'emiadmin' && password === '123456') {
        localStorage.setItem('admin_auth', 'true');
        document.cookie = 'admin_session=active; path=/; max-age=86400';
        setIsAuthenticated(true);
        setIsLoadingLogin(false);
        getAdminStats().then(setStats);
      } else {
        setIsLoadingLogin(false);
        setLoginError('Credenciales inválidas. Solo el Super Admin tiene acceso a este panel.');
      }
    }, 400);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    document.cookie = 'admin_session=; path=/; max-age=0';
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // 1. PANTALLA DE LOGIN (Si NO está autenticado)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-full max-w-md space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Acceso Super Admin
            </h1>
            <p className="text-xs text-zinc-500">
              Esta sección está protegida. Ingresá tus credenciales de administrador para continuar.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Usuario Super Admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingLogin}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoadingLogin ? (
                <span>Verificando...</span>
              ) : (
                <>
                  <span>INGRESAR COMO SUPER ADMIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[11px] text-zinc-400">
              🔒 Acceso restringido exclusivamente a administradores autorizados.
            </span>
          </div>

        </div>
      </div>
    );
  }

  // 2. PANEL SUPER ADMIN AUTENTICADO
  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-zinc-400">
        <ShieldCheck className="w-9 h-9 animate-spin mx-auto text-blue-500 mb-3" />
        <p className="text-sm font-semibold">Cargando métricas de Super Admin...</p>
      </div>
    );
  }

  const reunificationRate = stats.total_lost_reports > 0
    ? Math.round((stats.total_reunited_pets / stats.total_lost_reports) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header con indicador de usuario y botón de Cerrar Sesión */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Super Admin: emiadmin
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Panel de Control y Moderación
          </h1>
          <p className="text-sm text-zinc-500">
            Estadísticas en tiempo real de publicaciones, efectividad de reunificación y gestión de reportes en Trelew.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] font-semibold">Tasa de Éxito</div>
              <div className="text-sm font-black">{reunificationRate}% reunidas</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principales (4 Tarjetas KPI) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* 1. Mascotas Reunidas ❤️ */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between opacity-90">
            <span className="text-xs font-bold uppercase tracking-wider">Reunidas con Familias</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black">{stats.total_reunited_pets}</div>
          <div className="text-[11px] text-emerald-100">Mascotas devueltas a sus hogares</div>
        </div>

        {/* 2. Mascotas Perdidas Totales / Activas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Perdidas Activas</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {stats.active_lost_reports}
          </div>
          <div className="text-[11px] text-zinc-400">De un total de {stats.total_lost_reports} publicaciones</div>
        </div>

        {/* 3. Mascotas Encontradas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Encontradas en Tránsito</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.active_found_reports}
          </div>
          <div className="text-[11px] text-zinc-400">De un total de {stats.total_found_reports} rescatadas</div>
        </div>

        {/* 4. Avistamientos en la Vía Pública */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avistamientos</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500 dark:text-amber-400">
            {stats.total_sightings}
          </div>
          <div className="text-[11px] text-zinc-400">Reportes de vecinos en la calle</div>
        </div>

      </div>

      {/* Segunda Fila: Desglose por Ciudad, Actividad y Moderación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Desglose por Ciudad */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            Publicaciones por Ciudad
          </h3>

          <div className="space-y-2.5">
            {stats.reports_by_city.map((city) => (
              <div key={city.city_name} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{city.city_name}</span>
                <span className="font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {city.lost_count} reportes
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad de los últimos 7 días */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Actividad de los Últimos 7 Días
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Mascotas perdidas publicadas</span>
              <span className="font-bold text-rose-600">+{stats.recent_activity_last_7_days.lost_created}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Mascotas encontradas</span>
              <span className="font-bold text-emerald-600">+{stats.recent_activity_last_7_days.found_created}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Avistamientos informados</span>
              <span className="font-bold text-amber-500">+{stats.recent_activity_last_7_days.sightings_created}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Reunificaciones confirmadas</span>
              <span className="font-bold text-emerald-600">+{stats.recent_activity_last_7_days.reunited_count} ❤️</span>
            </div>
          </div>
        </div>

        {/* Bandeja de Moderación y Denuncias */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Denuncias Pendientes
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
              {stats.total_pending_moderations} pendientes
            </span>
          </div>

          {stats.total_pending_moderations === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">
              ✅ No hay denuncias de spam ni contenido sospechoso pendientes de revisión.
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs space-y-2">
              <div className="font-bold text-rose-800 dark:text-rose-300">
                1 Reporte marcado por posible estafa / dinero
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Publicación #394: Solicitud de dinero por adelantado en comentarios.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => alert('Publicación ocultada preventivamente.')}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                >
                  Ocultar Publicación
                </button>
                <button
                  type="button"
                  onClick={() => alert('Denuncia desestimada.')}
                  className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg text-[10px] transition-colors"
                >
                  Desestimar
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
