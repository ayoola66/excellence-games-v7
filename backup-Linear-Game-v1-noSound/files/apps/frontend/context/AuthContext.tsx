'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

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
        const hasToken = document.cookie.includes('userToken=') || document.cookie.includes('adminToken=')
        
        if (!hasToken) {
          setUser(null)
          setIsLoading(false)
          return
        }

        // Check user session only if we have a token
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        if (userResponse.ok) {
          const data = await userResponse.json()
          setUser(data.user)
        } else {
          // Clear user if not authenticated
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

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
      toast.success(`Welcome back, ${data.user.fullName || data.user.username}!`)
      return true
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
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
      toast.success(`Welcome back, ${data.admin.fullName}!`)
      return true
    } catch (error: any) {
      console.error('Admin login error:', error)
      toast.error(error.message || 'Admin login failed')
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
      document.cookie = 'userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      // Force redirect to login
      router.push('/login')
      router.refresh() // Force a full page refresh
      
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
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
      
      toast.success('Admin logged out successfully')
    } catch (error) {
      console.error('Admin logout error:', error)
      toast.error('Failed to logout')
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