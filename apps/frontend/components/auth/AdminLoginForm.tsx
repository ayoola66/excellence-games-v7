"use client"

import React, { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/context/AuthContext'
import { LoadingFallback } from '@/components/ui/LoadingFallback'

export function AdminLoginForm() {
  const router = useRouter()
  const { showToast } = useToast()
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

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: ''
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setErrors({ email: '', password: '', general: '' })
    
    try {
      console.log('[AdminLogin] Attempting login for:', formData.email)
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      })
      
      const data = await response.json()
      console.log('[AdminLogin] Login response status:', response.status)
      
      if (!response.ok) {
        if (data.error?.type === 'INVALID_CREDENTIALS') {
          setErrors({
            ...errors,
            general: 'Invalid email or password'
          })
          setFormData(prev => ({ ...prev, password: '' }))
        } else if (data.error?.type === 'RATE_LIMIT_EXCEEDED') {
          setErrors({
            ...errors,
            general: 'Too many login attempts. Please try again later.'
          })
        } else {
          setErrors({
            ...errors,
            general: data.error?.message || 'Login failed. Please try again.'
          })
        }
        throw new Error(data.error?.message || 'Login failed')
      }
      
      if (!data.admin) {
        setErrors({
          ...errors,
          general: 'Invalid response from server'
        })
        throw new Error('Invalid response from server')
      }

      // Set redirecting state
      setIsRedirecting(true)

      showToast({
        title: 'Success',
        message: `Welcome back, ${data.admin.fullName || data.admin.email}!`,
        type: 'success'
      })
      
      console.log('[AdminLogin] Login successful, refreshing auth state')
      
      // Ensure tokens are set before redirecting
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('[AdminLogin] Redirecting to dashboard')
      router.push('/admin/dashboard')
      router.refresh() // Force a refresh to update auth state
    } catch (error: any) {
      console.error('[AdminLogin] Login error:', error)
      const errorMessage = errors.general || error.message || 'An error occurred during login'
      showToast({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
      if (isRedirecting) {
        // If we were redirecting but hit an error, reset the state
        setTimeout(() => setIsRedirecting(false), 1000)
      }
    }
  }

  if (isRedirecting) {
    return <LoadingFallback message="Logging in, please wait..." />
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Admin Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              setErrors({ ...errors, email: '', general: '' })
            }}
            placeholder="Enter your admin email"
            className={errors.email ? 'border-red-500' : ''}
            disabled={isLoading || isRedirecting}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value })
              setErrors({ ...errors, password: '', general: '' })
            }}
            placeholder="Enter your admin password"
            className={errors.password ? 'border-red-500' : ''}
            disabled={isLoading || isRedirecting}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={isLoading || isRedirecting}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            {isRedirecting ? 'Redirecting...' : 'Signing in...'}
          </>
        ) : (
          'Sign in as Admin'
        )}
      </Button>
    </form>
  )
} 