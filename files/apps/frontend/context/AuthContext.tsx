'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

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
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = Cookies.get('auth-token')
      const adminToken = Cookies.get('admin-token')

      // Mock session validation - in demo mode we'll simulate valid sessions
      if (token) {
        // Simulate getting user from token
        const userData = {
          id: '1',
          email: 'user@example.com',
          fullName: 'Demo User',
          subscriptionStatus: 'free' as const,
          gameProgress: {},
          musicPreferences: {}
        }
        setUser(userData)
      }

      if (adminToken) {
        try {
          const response = await api.verifyAdminSession(adminToken)
          setAdmin(response.data.admin)
        } catch (error) {
          // Clear invalid admin token
          Cookies.remove('admin-token')
        }
      }
    } catch (error) {
      // Clear invalid tokens
      Cookies.remove('auth-token')
      Cookies.remove('admin-token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password)
      const { jwt, user: userData } = response

      // Check for existing session warning (mock implementation)
      if (userData.currentSessionToken && userData.currentSessionToken !== jwt) {
        toast.error('More than one active session noticed. See you on the other side!')
      }

      // Set token and user data
      Cookies.set('auth-token', jwt, { expires: 7 })
      setUser(userData)

      toast.success(`Welcome back, ${userData.fullName}!`)
      return true
    } catch (error: any) {
      const message = error.message || 'Login failed'
      toast.error(message)
      return false
    }
  }

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.adminLogin(email, password)
      const { token, admin: adminData } = response.data

      Cookies.set('admin-token', token, { expires: 1 }) // 1 day expiry
      setAdmin(adminData)

      toast.success(`Welcome, ${adminData.fullName}!`)
      return true
    } catch (error: any) {
      const message = error.message || 'Admin login failed'
      toast.error(message)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await api.register(userData)
      const { jwt, user: newUser } = response

      Cookies.set('auth-token', jwt, { expires: 7 })
      setUser(newUser)

      toast.success('Account created successfully!')
      return true
    } catch (error: any) {
      const message = error.message || 'Registration failed'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    Cookies.remove('auth-token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const adminLogout = async () => {
    try {
      // In production, we'd call the logout endpoint
      // For demo purposes, we'll just clear the tokens
    } catch (error) {
      // Silent fail for logout
    } finally {
      Cookies.remove('admin-token')
      setAdmin(null)
      toast.success('Admin logged out successfully')
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
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
    checkSession
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