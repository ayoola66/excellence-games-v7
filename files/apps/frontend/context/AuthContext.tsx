'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import compatToast from '@/lib/notificationManager';

interface User {
  id: string
  email: string
  username: string
  fullName?: string
  subscriptionStatus?: string
  premiumExpiry?: string
  preferences?: {
    musicEnabled: boolean
    musicVolume: number
  }
}

interface Admin {
  id: string
  email: string
  fullName: string
  adminType: 'SA' | 'DEV' | 'SH' | 'CT' | 'CS'
  badge: string
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  admin: Admin | null
  login: (email: string, password: string) => Promise<boolean>
  adminLogin: (email: string, password: string) => Promise<boolean>
  logout: () => void
  adminLogout: () => void
  isLoading: boolean
  setUser: (user: User | null) => void
  setAdmin: (admin: Admin | null) => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token before making the request
        const cookies = document.cookie.split(';')
        const userToken = cookies.find(cookie => cookie.trim().startsWith('clientUserToken='))
        const adminToken = cookies.find(cookie => cookie.trim().startsWith('adminToken='))
        
        if (!userToken && !adminToken) {
          setUser(null)
          setAdmin(null)
          setIsLoading(false)
          return
        }

        // Check user session if we have a user token
        if (userToken) {
          try {
            console.log('[AuthContext] Checking user auth with token');
            const userResponse = await fetch('/api/auth/me', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });

            if (userResponse.ok) {
              const data = await userResponse.json();
              console.log('[AuthContext] User auth successful');
              setUser(data.user);
            } else {
              // Log the error response
              const errorData = await userResponse.text();
              console.warn('[AuthContext] User auth check failed:', userResponse.status, errorData);
              
              // Only clear user token if it's invalid
              if (userResponse.status === 401) {
                console.warn('[AuthContext] Clearing invalid user token');
                document.cookie = 'clientUserToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                setUser(null);
              }
            }
          } catch (error) {
            console.warn('[AuthContext] User auth check error:', error);
            // Don't clear state on network errors
          }
        }

        // Check admin session if we have an admin token
        if (adminToken) {
          try {
            console.log('[AuthContext] Checking admin auth with token');
            const adminResponse = await fetch('/api/auth/admin/me', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });

            if (adminResponse.ok) {
              const data = await adminResponse.json();
              if (data.error && data.shouldRetry) {
                // Network error, keep existing state
                console.warn('[AuthContext] Network error during admin auth check:', data.error);
              } else {
                console.log('[AuthContext] Admin auth successful');
                setAdmin(data.admin);
              }
            } else {
              // Log the error response
              const errorData = await adminResponse.text();
              console.warn('[AuthContext] Admin auth check failed:', adminResponse.status, errorData);
              
              // Only clear admin token if it's invalid
              if (adminResponse.status === 401) {
                console.warn('[AuthContext] Clearing invalid admin token');
                document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                setAdmin(null);
                // Don't redirect here, let the page handle it
              }
            }
          } catch (error) {
            console.warn('[AuthContext] Admin auth check error:', error);
            // Don't clear state on network errors
          }
        }
      } catch (error) {
        console.error('[AuthContext] Auth check error:', error);
        // Don't clear states on network errors
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn('[AuthContext] Network error during auth check - maintaining current state');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()
      
      if (!data.user) {
        throw new Error('Invalid response from server')
      }

      setUser(data.user)
      compatToast.success(`Welcome back, ${data.user.fullName || data.user.username}!`)
      return true
    } catch (error: any) {
      console.error('Login error:', error)
      compatToast.error(error.message || 'Login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Invalid credentials')
      }

      const data = await response.json()
      
      if (!data.admin) {
        throw new Error('Invalid response from server')
      }

      setAdmin(data.admin)
      compatToast.success(`Welcome back, ${data.admin.fullName}!`)
      return true
    } catch (error: any) {
      console.error('Admin login error:', error)
      compatToast.error(error.message || 'Admin login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Clear user state first
      setUser(null)
      
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      // Clear cookies manually as well
      document.cookie = 'clientUserToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      // Force redirect to login
      router.push('/login')
      router.refresh() // Force a full page refresh
      
      compatToast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      compatToast.error('Failed to logout')
    }
  }

  const adminLogout = async () => {
    try {
      // Clear admin state first
      setAdmin(null)
      
      // Call admin logout endpoint
      await fetch('/api/auth/admin/logout', {
        method: 'POST',
        credentials: 'include'
      })

      // Clear cookies manually as well
      document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      // Force redirect to admin login
      router.push('/admin/login')
      router.refresh() // Force a full page refresh
      
      compatToast.success('Admin logged out successfully')
    } catch (error) {
      console.error('Admin logout error:', error)
      compatToast.error('Failed to logout')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        login,
        adminLogin,
        logout,
        adminLogout,
        isLoading,
        setUser,
        setAdmin,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}