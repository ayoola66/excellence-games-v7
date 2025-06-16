'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function AdminProfilePage() {
  const { admin, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login')
    }
  }, [admin, router])

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'permissions', name: 'Permissions', icon: ShieldCheckIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'activity', name: 'Activity Log', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center text-blue-700 hover:text-blue-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-900 p-2 rounded-xl">
                <ShieldCheckIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold text-blue-900">Admin Profile</h1>
            </div>
            
            <button
              onClick={logout}
              className="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-900 text-white shadow-lg'
                          : 'text-blue-700 hover:text-blue-900 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Account Overview Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Account Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Full Name
                      </label>
                      <p className="text-blue-900 font-semibold text-lg">{admin.fullName}</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Email Address
                      </label>
                      <p className="text-blue-900 font-semibold text-lg">{admin.email}</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Admin Type
                      </label>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-400 to-blue-500 text-white border border-blue-600">
                          <ShieldCheckIcon className="h-4 w-4 mr-2" />
                          {admin.adminType === 'SA' ? 'Super Admin' : 'Development Admin'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Last Login
                      </label>
                      <p className="text-blue-900 font-semibold text-lg">
                        {new Date().toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Quick Actions</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => router.push('/admin/dashboard')}
                      className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <ClipboardDocumentListIcon className="h-8 w-8 text-blue-700 mb-3" />
                      <span className="text-blue-900 font-medium">View Dashboard</span>
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/settings')}
                      className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <CogIcon className="h-8 w-8 text-blue-700 mb-3" />
                      <span className="text-blue-900 font-medium">System Settings</span>
                    </button>
                    
                    <button
                      onClick={() => router.push('/admin/notifications')}
                      className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <BellIcon className="h-8 w-8 text-blue-700 mb-3" />
                      <span className="text-blue-900 font-medium">Notifications</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Your Permissions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {admin.permissions.map((permission: string) => (
                    <div
                      key={permission}
                      className="flex items-center p-4 bg-blue-50 rounded-xl"
                    >
                      <ShieldCheckIcon className="h-5 w-5 text-blue-700 mr-3" />
                      <span className="text-blue-900 font-medium capitalize">
                        {permission.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Change Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Two-Factor Authentication</h3>
                    <p className="text-blue-700 mb-4">
                      Enhance your account security by enabling two-factor authentication.
                    </p>
                    <button
                      className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Activity Log</h2>
                
                <div className="space-y-4">
                  {[
                    {
                      action: 'Logged in',
                      timestamp: new Date().toISOString(),
                      ip: '192.168.1.1',
                      device: 'Chrome on MacOS'
                    },
                    {
                      action: 'Updated game settings',
                      timestamp: new Date(Date.now() - 3600000).toISOString(),
                      ip: '192.168.1.1',
                      device: 'Chrome on MacOS'
                    },
                    {
                      action: 'Added new question',
                      timestamp: new Date(Date.now() - 7200000).toISOString(),
                      ip: '192.168.1.1',
                      device: 'Chrome on MacOS'
                    }
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-xl"
                    >
                      <div>
                        <p className="text-blue-900 font-medium">{activity.action}</p>
                        <p className="text-blue-600 text-sm">
                          {new Date(activity.timestamp).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-700 text-sm">{activity.ip}</p>
                        <p className="text-blue-600 text-sm">{activity.device}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Profile Settings</h2>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={admin.fullName}
                      className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={admin.email}
                      className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Notification Preferences
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="form-checkbox text-blue-600" />
                        <span className="ml-2 text-blue-900">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="form-checkbox text-blue-600" />
                        <span className="ml-2 text-blue-900">System notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="form-checkbox text-blue-600" />
                        <span className="ml-2 text-blue-900">Security alerts</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}