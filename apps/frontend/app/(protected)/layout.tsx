'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth'
import { MainNav } from '@/components/navigation/MainNav'
import { Spinner } from '@/components/ui/Spinner'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, admin, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user && !admin) {
      // Not authenticated, redirect to login
      router.push('/login')
      return
    }

    // Check if admin is trying to access user routes or vice versa
    if (!isLoading && pathname) {
      const isAdminRoute = pathname.startsWith('/admin')
      const isUserRoute = pathname.startsWith('/user')

      if (isAdminRoute && !admin) {
        router.push('/login')
        return
      }

      if (isUserRoute && !user) {
        router.push('/login')
        return
      }
    }
  }, [isLoading, user, admin, pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 