import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthPath = path.startsWith('/auth');
  const isUserPath = path.startsWith('/user');
  const isGamePath = path.startsWith('/game');
  const isAdminPath = path.startsWith('/admin');
  
  // Check for user authentication
  const userToken = request.cookies.get('clientUserToken')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;
  
  // Redirect authenticated users away from auth pages
  if (isAuthPath && userToken) {
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }
  
  // Protect user paths
  if (isUserPath && !userToken) {
    const from = encodeURIComponent(path);
    return NextResponse.redirect(new URL(`/login?from=${from}`, request.url));
  }
  
  // Protect game paths
  if (isGamePath && !userToken) {
    const from = encodeURIComponent(path);
    return NextResponse.redirect(new URL(`/login?from=${from}`, request.url));
  }
  
  // Protect admin paths
  if (isAdminPath && !adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/user/:path*',
    '/game/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
};
