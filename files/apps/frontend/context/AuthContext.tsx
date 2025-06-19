'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
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

  // Check if we have a token in cookies
  const getTokenFromCookies = () => {
    if (typeof document === 'undefined') return { userToken: null, adminToken: null };
    
    const cookies = document.cookie.split(';');
    const userToken = cookies.find(cookie => cookie.trim().startsWith('clientUserToken='));
    const adminToken = cookies.find(cookie => cookie.trim().startsWith('adminToken='));
    
    return {
      userToken: userToken ? userToken.split('=')[1] : null,
      adminToken: adminToken ? adminToken.split('=')[1] : null
    };
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { userToken, adminToken } = getTokenFromCookies();
        
        if (!userToken && !adminToken) {
          setUser(null);
          setAdmin(null);
          setIsLoading(false);
          return;
        }

        // Check user session if we have a user token
        if (userToken) {
          try {
            console.log('[AuthContext] Checking user auth with token');
            const response = await axios.get('/api/auth/me', {
              withCredentials: true,
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });

            console.log('[AuthContext] User auth successful');
            setUser(response.data.user);
          } catch (error: any) {
            console.warn('[AuthContext] User auth check failed:', error.message);
            
            // Clear tokens on 401 Unauthorized
            if (error.response?.status === 401) {
              console.warn('[AuthContext] Clearing invalid user token');
              document.cookie = 'clientUserToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              document.cookie = 'userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              setUser(null);
            }
          }
        }

        // Check admin session if we have an admin token
        if (adminToken) {
          try {
            console.log('[AuthContext] Checking admin auth with token');
            const response = await axios.get('/api/auth/admin/me', {
              withCredentials: true,
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });

            console.log('[AuthContext] Admin auth successful');
            setAdmin(response.data.admin);
          } catch (error: any) {
            console.warn('[AuthContext] Admin auth check failed:', error.message);
            
            // Clear admin token on 401 Unauthorized
            if (error.response?.status === 401) {
              console.warn('[AuthContext] Clearing invalid admin token');
              document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              setAdmin(null);
            }
          }
        }
      } catch (error) {
        console.error('[AuthContext] Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      }, {
        withCredentials: true
      });

      if (response.data?.user) {
        setUser(response.data.user);
        compatToast.success(`Welcome back, ${response.data.user.fullName || response.data.user.username}!`)
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      compatToast.error(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await axios.post('/api/auth/admin/login', {
        email,
        password
      }, {
        withCredentials: true
      });

      if (response.data?.admin) {
        setAdmin(response.data.admin);
        compatToast.success(`Welcome back, ${response.data.admin.fullName}!`)
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('[AuthContext] Admin login error:', error);
      compatToast.error(error.message || 'Admin login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear user state first
      setUser(null);
      
      // Call logout endpoint
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });

      // Clear cookies manually as well
      document.cookie = 'clientUserToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Force redirect to login
      router.push('/login');
      router.refresh(); // Force a full page refresh
      
      compatToast.success('Logged out successfully');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      compatToast.error('Failed to logout');
    }
  };

  const adminLogout = async () => {
    try {
      // Clear admin state first
      setAdmin(null);
      
      // Call admin logout endpoint
      await axios.post('/api/auth/admin/logout', {}, {
        withCredentials: true
      });

      // Clear cookies manually as well
      document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Force redirect to admin login
      router.push('/admin/login');
      router.refresh(); // Force a full page refresh
      
      compatToast.success('Admin logged out successfully');
    } catch (error) {
      console.error('[AuthContext] Admin logout error:', error);
      compatToast.error('Failed to logout');
    }
  };

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