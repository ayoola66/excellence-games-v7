"use client"

import { useAuth } from '@/context/AuthContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { FullPageLoading } from '@/components/ui/LoadingFallback'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { admin, isLoading } = useAuth()

  if (isLoading) {
    return <FullPageLoading message="Loading..." />
  }

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