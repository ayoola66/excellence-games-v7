'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  GlobeEuropeAfricaIcon,
  UserIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { adminLogin, isLoading } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    
    try {
      const success = await adminLogin(loginData.email, loginData.password)
      if (success) {
        toast.success('Welcome to Elite Games Admin Panel!')
        router.push('/admin/dashboard')
      }
    } catch (error) {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const demoCredentials = [
    { label: 'Super Admin', email: 'superadmin@elitegames.com', password: 'SuperAdmin2024!', badge: 'SA', color: 'bg-red-500' },
    { label: 'Dev Admin', email: 'devadmin@elitegames.com', password: 'DevAdmin2024!', badge: 'DEV', color: 'bg-black' },
    { label: 'Content Admin', email: 'contentadmin@elitegames.com', password: 'ContentAdmin2024!', badge: 'CT', color: 'bg-purple-500' },
    { label: 'Shop Admin', email: 'shopadmin@elitegames.com', password: 'ShopAdmin2024!', badge: 'SH', color: 'bg-green-500' },
    { label: 'Customer Admin', email: 'customeradmin@elitegames.com', password: 'CustomerAdmin2024!', badge: 'CS', color: 'bg-blue-500' }
  ]

  const fillCredentials = (email: string, password: string) => {
    setLoginData({ email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <GlobeEuropeAfricaIcon className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Elite Games</h1>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-blue-200" />
              <p className="text-blue-100 font-medium">Admin Panel</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back, Admin</h2>
              <p className="text-gray-600 text-sm">Sign in to manage your trivia platform</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your admin email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loginLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In to Admin Panel'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
          <h3 className="text-white font-medium mb-3 text-center text-sm">Demo Accounts</h3>
          <div className="grid grid-cols-2 gap-2">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                onClick={() => fillCredentials(cred.email, cred.password)}
                className="flex items-center justify-between p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-xs"
              >
                <div className="flex items-center space-x-2">
                  <div className={`px-1.5 py-0.5 rounded text-xs font-bold text-white ${cred.color}`}>
                    {cred.badge}
                  </div>
                  <span className="truncate">{cred.label}</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-white/70 text-xs text-center mt-3">
            Click any account to auto-fill credentials
          </p>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Elite Games Admin Panel • Made with pride in the UK 🇬🇧
          </p>
        </div>
      </motion.div>
    </div>
  )
}