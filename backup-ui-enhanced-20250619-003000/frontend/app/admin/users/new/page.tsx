'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/lib/api'
import compatToast from '@/lib/notificationManager';

interface NewUser {
  username: string
  email: string
  fullName: string
  password: string
  subscriptionStatus: 'free' | 'premium'
  blocked: boolean
  confirmed: boolean
}

export default function NewUserPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<NewUser>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    subscriptionStatus: 'free',
    blocked: false,
    confirmed: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      await createUser(user)
      compatToast.success('User created successfully')
      router.push('/admin/users')
    } catch (error) {
      compatToast.error('Failed to create user')
      console.error('Error creating user:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create New User
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-6 sm:space-y-5">
          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Full Name
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="fullName"
                id="fullName"
                required
                value={user.fullName}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Email
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="email"
                name="email"
                id="email"
                required
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Username
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="username"
                id="username"
                required
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Password
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="password"
                name="password"
                id="password"
                required
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <label htmlFor="subscriptionStatus" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Subscription Status
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <select
                id="subscriptionStatus"
                name="subscriptionStatus"
                value={user.subscriptionStatus}
                onChange={(e) => setUser({ ...user, subscriptionStatus: e.target.value as 'free' | 'premium' })}
                className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Account Status
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="confirmed"
                    name="confirmed"
                    type="checkbox"
                    checked={user.confirmed}
                    onChange={(e) => setUser({ ...user, confirmed: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="confirmed" className="ml-3 block text-sm font-medium text-gray-700">
                    Confirmed
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="blocked"
                    name="blocked"
                    type="checkbox"
                    checked={user.blocked}
                    onChange={(e) => setUser({ ...user, blocked: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="blocked" className="ml-3 block text-sm font-medium text-gray-700">
                    Blocked
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 