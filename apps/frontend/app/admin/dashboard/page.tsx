"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FullPageLoading } from '@/components/ui/LoadingFallback'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useAdminPermissions } from '@/hooks/useAdminPermissions'
import { withAdminAuth } from '@/components/auth/withAdminAuth'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalGames: number
  totalQuestions: number
  totalOrders: number
  revenue: number
}

function AdminDashboardContent() {
  const router = useRouter()
  const { admin, isLoading: authLoading, authError } = useAuth()
  const { hasPermission } = useAdminPermissions()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If not authenticated and auth check is complete, redirect to login
    if (!authLoading && !admin) {
      console.log('[AdminDashboard] No admin found after auth check, redirecting to login')
      router.push('/admin/login')
      return
    }

    if (admin) {
      fetchDashboardStats()
    }
  }, [admin, authLoading, router])

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('[AdminDashboard] Fetching dashboard stats')
      const response = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include'
      })

      if (response.status === 401) {
        console.warn('[AdminDashboard] Unauthorized when fetching stats, redirecting to login')
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log('[AdminDashboard] Stats data received:', data)
        setStats(data)
      } else {
        console.warn('[AdminDashboard] Failed to fetch dashboard stats:', response.status)
        // Set default values if API fails
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalGames: 0,
          totalQuestions: 0,
          totalOrders: 0,
          revenue: 0
        })
        if (response.status !== 404) {
          throw new Error(`Failed to load dashboard data (${response.status})`)
        }
      }
    } catch (error: any) {
      console.error('[AdminDashboard] Error fetching dashboard stats:', error)
      setError('Failed to load dashboard data: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <FullPageLoading message="Verifying your admin account..." />
  }

  if (!admin) {
    // Will redirect to login in the useEffect
    return <FullPageLoading message="Redirecting to admin login..." />
  }

  if (loading) {
    return <FullPageLoading message="Loading admin dashboard..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
            <p className="text-red-600 mb-4">{authError}</p>
            <button
              onClick={() => router.push('/admin/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {admin.fullName || admin.email}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* User Stats */}
            {hasPermission('viewUserStats') && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.totalUsers}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.activeUsers}</p>
                </div>
              </>
            )}

            {/* Content Stats */}
            {hasPermission('manageGames') && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Games</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats?.totalGames}</p>
              </div>
            )}

            {/* Content Stats */}
            {hasPermission('manageQuestions') && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Questions</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600">{stats?.totalQuestions}</p>
              </div>
            )}

            {/* Shop Stats */}
            {hasPermission('viewFinancials') && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{stats?.totalOrders}</p>
              </div>
            )}

            {/* Shop Stats */}
            {hasPermission('viewFinancials') && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                <p className="mt-2 text-3xl font-bold text-yellow-600">£{stats?.revenue.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hasPermission('manageGames') && (
                <button
                  onClick={() => router.push('/admin/games')}
                  className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
                >
                  Manage Games
                </button>
              )}
              {hasPermission('manageQuestions') && (
                <button
                  onClick={() => router.push('/admin/questions')}
                  className="bg-green-600 text-white p-3 rounded hover:bg-green-700"
                >
                  Manage Questions
                </button>
              )}
              {hasPermission('manageProducts') && (
                <button
                  onClick={() => router.push('/admin/products')}
                  className="bg-purple-600 text-white p-3 rounded hover:bg-purple-700"
                >
                  Manage Products
                </button>
              )}
              {hasPermission('manageUsers') && (
                <button
                  onClick={() => router.push('/admin/users')}
                  className="bg-orange-600 text-white p-3 rounded hover:bg-orange-700"
                >
                  User Management
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Activity monitoring coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default withAdminAuth(AdminDashboardContent, {
  requiredSection: 'dashboard',
  requiredPermissions: ['viewAnalytics']
}) 