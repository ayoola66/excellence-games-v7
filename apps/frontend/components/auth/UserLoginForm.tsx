"use client"

import React, { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { LoadingFallback } from '@/components/ui/LoadingFallback'

interface Toast {
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export function UserLoginForm() {
  const router = useRouter()
  const { refreshAuth, authError, clearAuthError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  })

  // Clear auth context error when component mounts
  useEffect(() => {
    if (authError) {
      clearAuthError()
    }
  }, [authError, clearAuthError])

  const showToast = (toast: Toast) => {
    // Simple toast implementation
    const toastElement = document.createElement('div')
    toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      toast.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
      toast.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
      'bg-blue-100 border border-blue-400 text-blue-700'
    }`
    toastElement.innerHTML = `
      <div class="font-semibold">${toast.title}</div>
      <div class="text-sm">${toast.message}</div>
    `
    document.body.appendChild(toastElement)
    
    setTimeout(() => {
      toastElement.remove()
    }, 5000)
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: ''
    }
    
    if (!formData.email) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleLoginError = (errorData: any) => {
    const errorType = errorData?.type || 'UNKNOWN';
    const errorMessage = errorData?.message || 'Login failed. Please try again.';

    // British English error messages
    const errorMessages: { [key: string]: string } = {
      INVALID_CREDENTIALS: 'Invalid email address or password',
      FORBIDDEN: 'This email address is registered as an admin. Please use the admin login.',
      RATE_LIMIT_EXCEEDED: 'Too many login attempts. Please try again later.',
      NETWORK_ERROR: 'Unable to connect to the server. Please try again later.',
      UNKNOWN: errorMessage,
    };

    setErrors({ ...errors, general: errorMessages[errorType] || errorMessage });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setErrors({ email: '', password: '', general: '' })
    
    try {
      console.log('[UserLogin] Attempting login for:', formData.email)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      })
      
      const data = await response.json()
      console.log('[UserLogin] Login response status:', response.status)
      
      if (!response.ok) {
        handleLoginError(data.error)
        if (data.error?.type === 'INVALID_CREDENTIALS') {
          setFormData(prev => ({ ...prev, password: '' }))
        }
        throw new Error(data.error?.message || 'Login failed')
      }
      
      if (!data.user) {
        setErrors({
          ...errors,
          general: 'Invalid response from server'
        })
        throw new Error('Invalid response from server')
      }

      // Set redirecting state before showing toast
      setIsRedirecting(true)

      showToast({
        title: 'Success',
        message: `Welcome back, ${data.user.fullName || data.user.username}!`,
        type: 'success'
      })
      
      console.log('[UserLogin] Login successful, refreshing auth state')
      
      try {
        // This will trigger the AuthProvider to show a loading state and re-check auth
        await refreshAuth()
        
        // Redirect to the user's dashboard after successful login
        console.log('[UserLogin] Redirecting to dashboard')
        router.push('/user/dashboard')
      } catch (refreshError) {
        console.error('[UserLogin] Error refreshing auth state:', refreshError)
        setErrors({
          ...errors,
          general: 'Login successful but failed to update session. Please try again.'
        })
        setIsRedirecting(false)
      }
    } catch (error: any) {
      console.error('[UserLogin] Login error:', error)
      const errorMessage = errors.general || error.message || 'An error occurred during login'
      showToast({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      })
      setIsRedirecting(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isRedirecting) {
    return <LoadingFallback message="Signing in, please wait..." />
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setErrors({ ...errors, email: '', general: '' })
                }}
                placeholder="Enter your email address"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || isRedirecting}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setErrors({ ...errors, password: '', general: '' })
                }}
                placeholder="Enter your password"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || isRedirecting}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          disabled={isLoading || isRedirecting}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
} 