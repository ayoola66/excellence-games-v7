import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { UserLoginForm } from '../../components/auth/UserLoginForm'

export const metadata: Metadata = {
  title: 'User Login | Elite Games',
  description: 'Login to your Elite Games account to access your games and progress.',
}

export default function UserLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please sign in to your account
          </p>
        </div>
        
        <UserLoginForm />
        
        <div className="mt-6 text-center">
          <Link 
            href="/admin/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  )
} 