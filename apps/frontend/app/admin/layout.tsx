"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { FullPageLoading } from '@/components/ui/LoadingFallback'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { admin, isLoading } = useAuth()

  useEffect(() => {
    // If not loading and no admin, redirect to login
    if (!isLoading && !admin) {
      router.replace('/admin/login')
    }
  }, [isLoading, admin, router])

  // Show loading while checking auth
  if (isLoading) {
    return <FullPageLoading message="Verifying admin access..." />
  }

  // If no admin and not loading, don't render anything
  if (!admin) {
    return null
  }

  // Only render admin content if authenticated
  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  )
} 