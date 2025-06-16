'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, admin, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    const isAdminLoginPage = pathname === '/admin/login'

    // Handle admin login page
    if (isAdminLoginPage) {
      if (admin) {
        router.push('/admin/dashboard')
      }
      return
    }

    // Handle user login/register pages
    if (user) {
      router.push('/user')
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

  // For admin login page
  if (pathname === '/admin/login') {
    return !admin ? children : null
  }

  // For user login/register pages
  return !user ? children : null
} 