"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode, useRef } from 'react'
import { FullPageLoading } from '@/components/ui/LoadingFallback'
import type { AdminUser } from '@/types/admin'

interface User {
  id: number
  email: string
  username: string
  fullName?: string
  role?: string
  isActive: boolean
  isPremium: boolean
  subscriptionStatus?: string
}

interface AuthContextType {
  user: User | null
  admin: AdminUser | null
  isLoading: boolean
  error: string | null
  authError: string | null
  setUser: (user: User | null) => void
  setAdmin: (admin: AdminUser | null) => void
  setError: (error: string | null) => void
  clearAuthError: () => void
  refreshAuth: () => Promise<void>
  logout: () => Promise<void>
  adminLogout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  admin: null,
  isLoading: true,
  error: null,
  authError: null,
  setUser: () => {},
  setAdmin: () => {},
  setError: () => {},
  clearAuthError: () => {},
  refreshAuth: async () => {},
  logout: async () => {},
  adminLogout: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const isChecking = useRef(false)

  const clearAuthError = () => {
    setError(null)
    setAuthError(null)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setError(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      setError('Failed to logout')
    }
  }

  const adminLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { method: 'POST' })
      setAdmin(null)
      setError(null)
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Admin logout error:', error)
      setError('Failed to logout')
    }
  }

  // Only check auth once on mount
  useEffect(() => {
    if (hasInitialized || isChecking.current) return
    
    const checkInitialAuth = async () => {
      isChecking.current = true
      console.log('[AuthContext] Initial auth check starting')
      
      try {
        const cookies = document.cookie
        const hasUserToken = cookies.includes('clientUserToken=')
        const hasAdminToken = cookies.includes('clientAdminToken=')
        
        if (!hasUserToken && !hasAdminToken) {
          console.log('[AuthContext] No tokens found')
          setIsLoading(false)
          setHasInitialized(true)
          isChecking.current = false
          return
        }

        const pathname = window.location.pathname
        const isAdminPath = pathname.startsWith('/admin')

        // Only check the relevant auth type based on current path
        if (isAdminPath && hasAdminToken) {
          console.log('[AuthContext] Checking admin auth')
          try {
            const response = await fetch('/api/auth/admin/me', {
              credentials: 'include',
              headers: { 'Cache-Control': 'no-cache' },
              cache: 'no-store'
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.admin) {
                setAdmin(data.admin)
                console.log('[AuthContext] Admin auth successful', data.admin)
              } else {
                console.warn('[AuthContext] Admin auth response missing admin data')
                document.cookie = 'clientAdminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                setError('Admin session invalid. Please login again.')
              }
            } else if (response.status === 401) {
              console.warn('[AuthContext] Admin auth failed: Unauthorized')
              document.cookie = 'clientAdminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
              setError('Admin session expired. Please login again.')
            } else {
              console.error('[AuthContext] Admin auth check failed with status:', response.status)
              setError('Failed to verify admin session. Please try again.')
            }
          } catch (error) {
            console.error('[AuthContext] Admin auth check failed:', error)
            setError('Network error checking admin session. Please try again.')
          }
        } else if (!isAdminPath && hasUserToken) {
          console.log('[AuthContext] Checking user auth')
          try {
            const response = await fetch('/api/auth/me', {
              credentials: 'include',
              headers: { 'Cache-Control': 'no-cache' },
              cache: 'no-store'
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.user) {
                setUser(data.user)
                console.log('[AuthContext] User auth successful', data.user)
              } else {
                console.warn('[AuthContext] User auth response missing user data')
                document.cookie = 'clientUserToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                setError('User session invalid. Please login again.')
              }
            } else if (response.status === 401) {
              console.warn('[AuthContext] User auth failed: Unauthorized')
              document.cookie = 'clientUserToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
              setError('User session expired. Please login again.')
            } else {
              console.error('[AuthContext] User auth check failed with status:', response.status)
              setError('Failed to verify user session. Please try again.')
            }
          } catch (error) {
            console.error('[AuthContext] User auth check failed:', error)
            setError('Network error checking user session. Please try again.')
          }
        }
      } catch (error) {
        console.error('[AuthContext] Auth check error:', error)
        setError('Error checking authentication. Please try again.')
      } finally {
        setIsLoading(false)
        setHasInitialized(true)
        isChecking.current = false
        console.log('[AuthContext] Initial auth check completed')
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      checkInitialAuth()
    } else {
      // If running on server, just mark as not loading
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [hasInitialized])

  // Manual refresh function for after login
  const refreshAuth = async () => {
    if (isChecking.current) {
      console.log('[AuthContext] Auth check already in progress, skipping refresh')
      return
    }
    
    console.log('[AuthContext] Manual refresh triggered')
    setIsLoading(true)
    setError(null)
    setHasInitialized(false)
    
    // Small delay to ensure tokens are set
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // If still loading for more than 10 seconds, something is wrong
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        console.warn('[AuthContext] Auth check taking too long, forcing completion')
        setIsLoading(false)
        setHasInitialized(true)
        isChecking.current = false
      }, 10000)
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isLoading])

  // Show loading state during initial auth check
  if (isLoading && !hasInitialized) {
    return <FullPageLoading message="Verifying authentication..." />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isLoading,
        error,
        authError,
        setUser,
        setAdmin,
        setError,
        clearAuthError,
        refreshAuth,
        logout,
        adminLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 