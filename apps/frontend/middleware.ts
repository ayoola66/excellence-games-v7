import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get tokens from cookies
  const userToken = request.cookies.get('clientUserToken')?.value || ''
  const adminToken = request.cookies.get('clientAdminToken')?.value || ''

  console.log(`[Middleware] Path: ${pathname} UserToken: ${!!userToken} AdminToken: ${!!adminToken}`)

  // Skip middleware for debug route
  if (pathname.startsWith('/debug')) {
    return NextResponse.next()
  }

  // Define protected routes
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  const isUserRoute = pathname.startsWith('/user')
  const isProtectedRoute = pathname.startsWith('/(protected)')

  // Admin route protection
  if (isAdminRoute) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // User route protection
  if (isUserRoute || isProtectedRoute) {
    if (!userToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users away from login pages
  if (pathname === '/login' && userToken) {
    return NextResponse.redirect(new URL('/user/dashboard', request.url))
  }

  if (pathname === '/admin/login' && adminToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Allow landing page to be visible
  if (pathname === '/') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else if (userToken) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
    // If no token, allow access to landing page
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 