import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('fb-access-token')?.value;
  const role = request.cookies.get('fb-user-role')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    '/dashboard',
    '/futurechat',
    '/predictions',
    '/settings',
    '/sensors',
    '/admin',
    '/knowledge',
    '/feed',
    '/intel-feed'
  ];
  
  // Check if current path matches any protected route prefix
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');

  // 1. Unauthenticated users accessing protected pages
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Non-admins accessing /admin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // 3. Authenticated users trying to access login/signup pages
  if (isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Next.js middleware routing matcher optimization
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/futurechat/:path*',
    '/predictions/:path*',
    '/settings/:path*',
    '/sensors/:path*',
    '/admin/:path*',
    '/knowledge/:path*',
    '/feed/:path*',
    '/intel-feed/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
};
