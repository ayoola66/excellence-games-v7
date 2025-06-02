'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { strapiApi } from '@/lib/strapiApi'

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

      // Check user session
      if (token) {
        try {
          // In a real app, we'd verify the token with the backend
          // For now, we'll check if the token exists and is valid
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            // Token is invalid, clear it
            Cookies.remove('auth-token')
            localStorage.removeItem('auth-token')
          }
        } catch (error) {
          // Backend not available, clear token
          Cookies.remove('auth-token')
          localStorage.removeItem('auth-token')
        }
      }

      // Check admin session
      if (adminToken) {
        try {
          const response = await strapiApi.verifyAdminSession(adminToken)
          setAdmin(response.data.admin)
        } catch (error) {
          // Clear invalid admin token
          Cookies.remove('admin-token')
          localStorage.removeItem('admin-token')
        }
      }
    } catch (error) {
      console.error('Session check failed:', error)
      // Clear all tokens on error
      Cookies.remove('auth-token')
      Cookies.remove('admin-token')
      localStorage.removeItem('auth-token')
      localStorage.removeItem('admin-token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await strapiApi.login(email, password)
      const { jwt, user: userData } = response

      // Set token and user data
      Cookies.set('auth-token', jwt, { expires: 7 })
      localStorage.setItem('auth-token', jwt)
      setUser(userData)

      toast.success(`Welcome back, ${userData.fullName || userData.username}!`)
      return true
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Login failed'
      toast.error(message)
      return false
    }
  }

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await strapiApi.adminLogin(email, password)
      const { token, admin: adminData } = response.data

      Cookies.set('admin-token', token, { expires: 1 }) // 1 day expiry
      localStorage.setItem('admin-token', token)
      setAdmin(adminData)

      toast.success(`Welcome, ${adminData.fullName}!`)
      return true
    } catch (error: any) {
      // Fallback to mock admin authentication for demo purposes
      console.log('Backend admin auth failed, using mock authentication')
      
      const mockAdmins = {
        'superadmin@elitegames.com': {
          password: 'SuperAdmin2024!',
          admin: {
            id: '1',
            email: 'superadmin@elitegames.com',
            fullName: 'Super Administrator',
            adminType: 'SA' as const,
            badge: 'SA',
            permissions: ['all']
          }
        },
        'devadmin@elitegames.com': {
          password: 'DevAdmin2024!',
          admin: {
            id: '2', 
            email: 'devadmin@elitegames.com',
            fullName: 'Development Administrator',
            adminType: 'DEV' as const,
            badge: 'DEV',
            permissions: ['games', 'users', 'analytics']
          }
        },
        'contentadmin@elitegames.com': {
          password: 'ContentAdmin2024!',
          admin: {
            id: '3',
            email: 'contentadmin@elitegames.com', 
            fullName: 'Content Administrator',
            adminType: 'CT' as const,
            badge: 'CT',
            permissions: ['games', 'questions', 'categories']
          }
        },
        'shopadmin@elitegames.com': {
          password: 'ShopAdmin2024!',
          admin: {
            id: '4',
            email: 'shopadmin@elitegames.com',
            fullName: 'Shop Administrator', 
            adminType: 'SH' as const,
            badge: 'SH',
            permissions: ['users', 'orders', 'analytics']
          }
        },
        'customeradmin@elitegames.com': {
          password: 'CustomerAdmin2024!',
          admin: {
            id: '5',
            email: 'customeradmin@elitegames.com',
            fullName: 'Customer Administrator',
            adminType: 'CS' as const, 
            badge: 'CS',
            permissions: ['users', 'support']
          }
        }
      }

      const mockAdmin = mockAdmins[email as keyof typeof mockAdmins]
      
      if (mockAdmin && mockAdmin.password === password) {
        const mockToken = `mock-token-${Date.now()}`
        
        Cookies.set('admin-token', mockToken, { expires: 1 })
        localStorage.setItem('admin-token', mockToken)
        setAdmin(mockAdmin.admin)

        toast.success(`Welcome, ${mockAdmin.admin.fullName}! (Demo Mode)`)
        return true
      }
      
      const message = 'Invalid admin credentials'
      toast.error(message)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
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
      localStorage.setItem('auth-token', jwt)
      setUser(newUser)

      toast.success('Account created successfully!')
      return true
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Registration failed'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    Cookies.remove('auth-token')
    localStorage.removeItem('auth-token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const adminLogout = async () => {
    try {
      // In production, we'd call the logout endpoint
      // For now, we'll just clear the tokens
    } catch (error) {
      // Silent fail for logout
    } finally {
      Cookies.remove('admin-token')
      localStorage.removeItem('admin-token')
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