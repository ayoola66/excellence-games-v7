import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AdminRole } from '@/types/admin'

// Map URL patterns to required permissions
const ROUTE_PERMISSIONS: Record<string, { roles: AdminRole[]; permissions: string[] }> = {
  '/admin/dashboard': {
    roles: ['super_admin', 'dev_admin', 'shop_admin', 'content_admin', 'customer_admin'],
    permissions: ['viewAnalytics']
  },
  '/admin/system': {
    roles: ['super_admin', 'dev_admin'],
    permissions: ['manageSystemSettings']
  },
  '/admin/games': {
    roles: ['super_admin', 'dev_admin', 'content_admin'],
    permissions: ['manageGames']
  },
  '/admin/questions': {
    roles: ['super_admin', 'dev_admin', 'content_admin'],
    permissions: ['manageQuestions']
  },
  '/admin/categories': {
    roles: ['super_admin', 'dev_admin', 'content_admin'],
    permissions: ['manageCategories']
  },
  '/admin/users': {
    roles: ['super_admin', 'dev_admin', 'customer_admin'],
    permissions: ['manageUsers']
  },
  '/admin/subscriptions': {
    roles: ['super_admin', 'shop_admin', 'customer_admin'],
    permissions: ['manageUserSubscriptions']
  },
  '/admin/shop': {
    roles: ['super_admin', 'shop_admin'],
    permissions: ['manageProducts']
  },
  '/admin/orders': {
    roles: ['super_admin', 'shop_admin', 'customer_admin'],
    permissions: ['manageOrders']
  },
  '/admin/music': {
    roles: ['super_admin', 'dev_admin', 'content_admin'],
    permissions: ['manageBackgroundMusic']
  },
  '/admin/analytics': {
    roles: ['super_admin', 'dev_admin', 'shop_admin', 'content_admin', 'customer_admin'],
    permissions: ['viewAnalytics']
  }
}

export async function adminAuthMiddleware(request: NextRequest) {
  // Skip middleware for login page and API routes
  if (
    request.nextUrl.pathname === '/admin/login' ||
    request.nextUrl.pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const authToken = request.cookies.get('adminAccessToken')?.value
  if (!authToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    // Verify token and get admin data
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/admin-users/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to verify admin token')
    }

    const adminData = await response.json()
    const adminRole = adminData.role?.type as AdminRole

    // Check if admin has access to the requested route
    const path = request.nextUrl.pathname
    const routePermissions = Object.entries(ROUTE_PERMISSIONS).find(([route]) =>
      path.startsWith(route)
    )?.[1]

    if (routePermissions) {
      const hasRole = routePermissions.roles.includes(adminRole)
      const hasPermissions = routePermissions.permissions.every(
        permission => adminData.permissions?.[permission]
      )

      if (!hasRole || !hasPermissions) {
        // Redirect to dashboard if admin doesn't have required permissions
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete('adminAccessToken')
    response.cookies.delete('adminRefreshToken')
    return response
  }
} 