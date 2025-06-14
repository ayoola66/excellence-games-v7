'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { strapiApi } from '@/lib/strapiApi'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  fullName: string
  subscriptionStatus: 'free' | 'premium' | 'expired'
  premiumExpiry?: string
  gameProgress?: any
  musicPreferences?: any
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
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  adminLogin: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  adminLogout: () => void
  updateUser: (userData: Partial<User>) => void
  verifySession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        setIsLoading(true)
        const token = Cookies.get('auth-token')
        const adminToken = Cookies.get('admin-token')

        // Check user session
        if (token) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/users/me`, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache'
              }
            })
            
            if (response.ok) {
              const userData = await response.json()
              setUser(userData)
            } else {
              // Only clear if response is 401 (Unauthorized)
              if (response.status === 401) {
                clearUserTokens()
              }
            }
          } catch (error) {
            console.error('Failed to verify user session:', error)
            // Don't clear tokens on network errors
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
              console.log('Network error, keeping session')
            } else {
              clearUserTokens()
            }
          }
        }

        // Check admin session
        if (adminToken) {
          try {
            const response = await strapiApi.verifyAdminSession(adminToken)
            setAdmin(response.data.admin)
          } catch (error: any) {
            console.error('Failed to verify admin session:', error)
            // Only clear admin token on auth errors
            if (error.response?.status === 401) {
              clearAdminTokens()
            }
          }
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [])

  const clearUserTokens = () => {
    Cookies.remove('auth-token')
    setUser(null)
  }

  const clearAdminTokens = () => {
    Cookies.remove('admin-token')
    setAdmin(null)
  }

  const clearAllTokens = () => {
    clearUserTokens()
    clearAdminTokens()
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await strapiApi.login(email, password)
      const { jwt, user: userData } = response

      Cookies.set('auth-token', jwt, { expires: 7 })
      setUser(userData)
      toast.success(`Welcome back, ${userData.fullName || userData.username}!`)
      return true
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Login failed'
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await strapiApi.adminLogin(email, password)
      const { token, admin: adminData } = response.data

      Cookies.set('admin-token', token, { expires: 1 })
      setAdmin(adminData)

      toast.success(`Welcome, ${adminData.fullName}!`)
      return true
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Invalid admin credentials'
      toast.error(message)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await strapiApi.register({
        username: userData.email,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone,
        deliveryAddress: userData.deliveryAddress,
      })
      
      const { jwt, user: newUser } = response

      Cookies.set('auth-token', jwt, { expires: 7 })
      setUser(newUser)
      toast.success('Account created successfully!')
      return true
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Registration failed'
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearUserTokens()
    toast.success('Logged out successfully')
    // Redirect to home page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const adminLogout = async () => {
    try {
      // In production, call the logout endpoint if available
      // await strapiApi.adminLogout()
    } catch (error) {
      // Silent fail for logout
    } finally {
      clearAdminTokens()
      toast.success('Admin logged out successfully')
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
    }
  }

  const verifySession = async () => {
    try {
      setIsLoading(true)
      const token = Cookies.get('auth-token')
      const adminToken = Cookies.get('admin-token')

      // Check user session
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/users/me`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Cache-Control': 'no-cache'
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            // Only clear if response is 401 (Unauthorized)
            if (response.status === 401) {
              clearUserTokens()
            }
          }
        } catch (error) {
          console.error('Failed to verify user session:', error)
          // Don't clear tokens on network errors
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.log('Network error, keeping session')
          } else {
            clearUserTokens()
          }
        }
      }

      // Check admin session
      if (adminToken) {
        try {
          const response = await strapiApi.verifyAdminSession(adminToken)
          setAdmin(response.data.admin)
        } catch (error: any) {
          console.error('Failed to verify admin session:', error)
          // Only clear admin token on auth errors
          if (error.response?.status === 401) {
            clearAdminTokens()
          }
        }
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    admin,
    isLoading,
    login,
    adminLogin,
    register,
    logout,
    adminLogout,
    updateUser,
    verifySession
  }

  return (
    <AuthContext.Provider value={value}>
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