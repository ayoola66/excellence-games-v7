'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { strapiApi } from '@/lib/strapiApi'
import { toast } from 'react-hot-toast'
import {
  UserIcon,
  MusicalNoteIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { User, UserPreferences, BillingInfo } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (error: any, message: string) => {
    console.error(message, error)
    setError(error.message || message)
    toast.error(error.message || message)
  }

  const handleMusicUpload = async (file: File) => {
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('files', file)
      await strapiApi.uploadMusicTrack({
        name: file.name,
        type: 'user',
        audioFile: file
      })
      toast.success('Music track uploaded successfully')
    } catch (error: any) {
      handleError(error, 'Failed to upload music track')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVolumeChange = async (volume: number) => {
    if (!user?.preferences) return

    try {
      await strapiApi.updateSettings({
        ...user.preferences,
        musicVolume: volume
      } as UserPreferences)
      updateUser({ ...user, preferences: { ...user.preferences, musicVolume: volume } })
    } catch (error: any) {
      handleError(error, 'Failed to update volume')
    }
  }

  const handleMusicToggle = async (enabled: boolean) => {
    if (!user?.preferences) return

    try {
      await strapiApi.updateSettings({
        ...user.preferences,
        musicEnabled: enabled
      } as UserPreferences)
      updateUser({ ...user, preferences: { ...user.preferences, musicEnabled: enabled } })
    } catch (error: any) {
      handleError(error, 'Failed to update music settings')
    }
  }

  const handleBillingSubmit = async (formData: FormData) => {
    const billingInfo: BillingInfo = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      country: formData.get('country') as string,
      postcode: formData.get('postcode') as string
    }

    setIsLoading(true)
    setError(null)

    try {
      await strapiApi.updateBillingInfo(billingInfo)
      toast.success('Billing information updated successfully')
    } catch (error: any) {
      handleError(error, 'Failed to update billing information')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'music', name: 'Music', icon: MusicalNoteIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon },
    { id: 'language', name: 'Language', icon: GlobeAltIcon }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => router.push('/user')}
              className="flex items-center text-blue-700 hover:text-blue-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-900 p-2 rounded-xl">
                <Cog6ToothIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold text-blue-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-900 text-white shadow-lg'
                        : 'text-blue-700 hover:text-blue-900 hover:bg-blue-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">Username</label>
                      <p className="text-blue-900 font-semibold text-lg">{user?.username}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">Email</label>
                      <p className="text-blue-900 font-semibold text-lg">{user?.email}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">Full Name</label>
                      <p className="text-blue-900 font-semibold text-lg">{user?.fullName || 'Not set'}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">Subscription</label>
                      <p className="text-blue-900 font-semibold text-lg capitalize">{user?.subscriptionStatus || 'Free'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'music' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Music Settings</h2>
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Custom Background Music</h3>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleMusicUpload(file)
                        }}
                        className="w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700"
                      />
                      <p className="mt-2 text-sm text-gray-500">Maximum file size: 2MB</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Volume Control</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-700">Music Volume</span>
                          <span className="text-sm text-blue-700">{user?.preferences?.musicVolume || 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={user?.preferences?.musicVolume || 50}
                          onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">Background Music</h3>
                          <p className="text-sm text-gray-500 mt-1">Enable or disable background music while playing</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user?.preferences?.musicEnabled || false}
                            onChange={(e) => handleMusicToggle(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Billing Information</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleBillingSubmit(new FormData(e.target as HTMLFormElement))
                  }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                          type="text"
                          name="address"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          name="country"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                        <input
                          type="text"
                          name="postcode"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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
                        'Update Billing Information'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Preferences</h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">Email Notifications</h3>
                          <p className="text-sm text-gray-500 mt-1">Receive email updates about new games and features</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user?.preferences?.emailNotifications || false}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'language' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Language Settings</h2>
                  <div className="bg-blue-50 rounded-xl p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Language</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="en-GB"
                    >
                      <option value="en-GB">English (UK)</option>
                      <option value="en-US">English (US)</option>
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}