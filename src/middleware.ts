import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rutas protegidas que requieren validación de sesión obligatoria
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/mis-reportes');

  // 2. Verificar si el usuario tiene cookies de autenticación de Supabase
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-') || cookie.name.includes('auth-token'));

  // Si es una ruta pública y el usuario no tiene cookies de sesión,
  // retornamos de inmediato sin invocar Supabase Auth (0ms, 0 compute, 0 bandwidth)
  if (!isProtectedPath && !hasAuthCookie) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

