'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import AuthenticatedMenu from '@/components/AuthenticatedMenu'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, admin, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    const isAdminRoute = pathname.startsWith('/admin')

    // Handle admin routes
    if (isAdminRoute) {
      if (!admin) {
        router.push('/admin/login')
      }
      return
    }

    // Handle user routes
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`)
    }
  }, [user, admin, isLoading, router, pathname])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // For admin routes, check admin auth
  if (pathname.startsWith('/admin')) {
    return admin ? children : null
  }

  // For user routes, check user auth
  return user ? (
    <div className="flex">
      <AuthenticatedMenu />
      <div className="flex-1 ml-16 md:ml-56">{children}</div>
    </div>
  ) : null
} 