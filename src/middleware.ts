import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROUTES = ['/admin'];
const PROTECTED_ROUTES = ['/profile', '/my-bookings', '/checkout', '/payment'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Rutas permitidas para RECEPCIONISTA dentro de /admin
const RECEPCIONISTA_ALLOWED_ROUTES = [
  '/admin/reservations',
  '/admin/payments',
  '/admin/reports',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('auth_role')?.value;

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect logged-in users away from login/register
  if (isAuthRoute && token) {
    const dest = role === 'ADMIN' ? '/admin/movies' : role === 'RECEPCIONISTA' ? '/admin/reservations' : '/';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Admin routes: require auth + correct role
  if (isAdminRoute) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (role !== 'ADMIN' && role !== 'RECEPCIONISTA') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (role === 'RECEPCIONISTA' && !RECEPCIONISTA_ALLOWED_ROUTES.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/admin/reservations', request.url));
    }
  }

  // Protected user routes: require auth
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
