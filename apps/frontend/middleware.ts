import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuthMiddleware } from './middleware/adminAuth'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes that handle their own auth
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminAuthMiddleware(request)
  }

  // Handle protected API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const authToken = request.cookies.get('clientUserToken')?.value
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Handle protected user routes
  if (
    request.nextUrl.pathname.startsWith('/user') ||
    request.nextUrl.pathname.startsWith('/game')
  ) {
    const authToken = request.cookies.get('clientUserToken')?.value
    if (!authToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/user/:path*',
    '/game/:path*',
    '/api/:path*'
  ]
} 