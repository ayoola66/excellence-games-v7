'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If user is not logged in and we're done loading, redirect to login
    if (!user && !isLoading) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`)
    }
  }, [user, isLoading, router, pathname])

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

  // If user is logged in, show protected content
  if (user) {
    return children
  }

  // Return null while redirecting
  return null
} 