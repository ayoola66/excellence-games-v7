import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { AdminLoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Admin Login | Elite Games',
  description: 'Secure login portal for Elite Games administrators.',
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please sign in with your administrator credentials
          </p>
        </div>
        
        <AdminLoginForm />
        
        <div className="mt-6 text-center">
          <Link 
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to User Login
          </Link>
        </div>
      </div>
    </div>
  )
} 