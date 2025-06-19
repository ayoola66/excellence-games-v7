'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { 
  ArrowLeftIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import compatToast from '@/lib/notificationManager';

export default function AdminLoginPage() {
  const router = useRouter()
  const { admin, setAdmin } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      compatToast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()

      if (!data.admin) {
        throw new Error('Admin data is missing from response')
      }

      // Set the admin in the auth context and redirect
      setAdmin(data.admin)
      compatToast.success(`Welcome back, ${data.admin.fullName || data.admin.username || 'Admin'}!`)
      router.push('/admin/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'Login failed. Please try again.'
      compatToast.error(errorMessage)
      
      // If the error is related to invalid credentials, clear the password field
      if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('incorrect')) {
        setFormData(prev => ({ ...prev, password: '' }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 bg-white">
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-900 p-3 rounded-xl">
            <ShieldCheckIcon className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600">Please sign in to access the admin panel.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Admin Panel</h2>
            <p className="text-lg opacity-90">
              Manage your trivia games, users, and content from one central location.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 