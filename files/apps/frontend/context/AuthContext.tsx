'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Configure axios defaults
  useEffect(() => {
    const token = Cookies.get('auth-token')
    const adminToken = Cookies.get('admin-token')
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    if (adminToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
    }
  }, [])

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = Cookies.get('auth-token')
      const adminToken = Cookies.get('admin-token')

      if (token) {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
      }

      if (adminToken) {
        const response = await axios.post(`${API_URL}/api/admin-users/verify-session`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
        setAdmin(response.data.data.admin)
      }
    } catch (error) {
      // Clear invalid tokens
      Cookies.remove('auth-token')
      Cookies.remove('admin-token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: email,
        password,
      })

      const { jwt, user: userData } = response.data

      // Check for existing session warning
      if (userData.currentSessionToken && userData.currentSessionToken !== jwt) {
        toast.error('More than one active session noticed. See you on the other side!')
      }

      // Set token and user data
      Cookies.set('auth-token', jwt, { expires: 7 })
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
      setUser(userData)

      toast.success(`Welcome back, ${userData.fullName}!`)
      return true
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Login failed'
      toast.error(message)
      return false
    }
  }

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/api/admin-users/login`, {
        email,
        password,
      })

      const { token, admin: adminData } = response.data.data

      Cookies.set('admin-token', token, { expires: 1 }) // 1 day expiry
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setAdmin(adminData)

      toast.success(`Welcome, ${adminData.fullName}!`)
      return true
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Admin login failed'
      toast.error(message)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/local/register`, {
        username: userData.email,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone,
        deliveryAddress: userData.deliveryAddress,
      })

      const { jwt, user: newUser } = response.data

      Cookies.set('auth-token', jwt, { expires: 7 })
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
      setUser(newUser)

      toast.success('Account created successfully!')
      return true
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Registration failed'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    Cookies.remove('auth-token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  const adminLogout = async () => {
    try {
      const adminToken = Cookies.get('admin-token')
      if (adminToken) {
        await axios.post(`${API_URL}/api/admin-users/logout`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      }
    } catch (error) {
      // Silent fail for logout
    } finally {
      Cookies.remove('admin-token')
      delete axios.defaults.headers.common['Authorization']
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
    checkSession,
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