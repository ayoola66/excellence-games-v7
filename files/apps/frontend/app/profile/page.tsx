'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  CreditCardIcon,
  MusicalNoteIcon,
  ChartBarIcon,
  CogIcon,
  StarIcon,
  CloudArrowUpIcon,
  ArrowLeftIcon,
  PlayIcon,
  CheckCircleIcon,
  TrophyIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit for premium users)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file')
      return
    }

    setMusicFile(file)
    setUploading(true)

    // Simulate upload
    setTimeout(() => {
      toast.success('Music uploaded successfully!')
      setUploading(false)
      setMusicFile(null)
      // Reset input
      if (e.target) e.target.value = ''
    }, 2000)
  }

  const upgradeSubscription = () => {
    toast.success('Redirecting to payment gateway...')
    // In production, this would redirect to Stripe checkout
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'subscription', name: 'Subscription', icon: CreditCardIcon },
    { id: 'music', name: 'Music', icon: MusicalNoteIcon },
    { id: 'progress', name: 'Progress', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-blue-700 hover:text-blue-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Games
            </button>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-900 p-2 rounded-xl">
                <UserIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold text-blue-900">My Profile</h1>
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
                      <p className="text-blue-900 font-semibold text-lg">{user.fullName}</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Email Address
                      </label>
                      <p className="text-blue-900 font-semibold text-lg">{user.email}</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Subscription Status
                      </label>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                          user.subscriptionStatus === 'premium'
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border border-yellow-600'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscriptionStatus === 'premium' ? (
                            <>
                              <StarIcon className="h-4 w-4 mr-2" />
                              Premium Member
                            </>
                          ) : (
                            'Free Member'
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {user.subscriptionStatus === 'premium' && user.premiumExpiry && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Premium Expires
                        </label>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
                          <p className="text-blue-900 font-semibold">
                            {new Date(user.premiumExpiry).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-blue-800">
                    <TrophyIcon className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-blue-900 mb-2">
                      {Object.keys(user.gameProgress || {}).length}
                    </div>
                    <p className="text-blue-600 font-medium">Games Played</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-yellow-400">
                    <StarIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-blue-900 mb-2">
                      {user.totalScore || 0}
                    </div>
                    <p className="text-blue-600 font-medium">Total Score</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-indigo-400">
                    <MusicalNoteIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-blue-900 mb-2">
                      {user.uploadedMusic?.length || 0}
                    </div>
                    <p className="text-blue-600 font-medium">Music Tracks</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-blue-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {user.gameProgress && Object.keys(user.gameProgress).length > 0 ? (
                      Object.entries(user.gameProgress).slice(0, 3).map(([gameId, progress]: [string, any]) => (
                        <div key={gameId} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-center">
                            <PlayIcon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                              <p className="font-semibold text-blue-900">Game {gameId}</p>
                              <p className="text-sm text-blue-600">Progress: {progress.currentLevel || 1}</p>
                            </div>
                          </div>
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-600 italic text-center py-8">No recent activity. Start playing some games!</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Subscription Management</h2>
                  
                  {user.subscriptionStatus === 'premium' ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-6">
                      <div className="flex items-center mb-4">
                        <StarIcon className="h-8 w-8 text-yellow-500 mr-3" />
                        <h3 className="text-xl font-bold text-yellow-900">Premium Member</h3>
                      </div>
                      <p className="text-yellow-800 mb-4">
                        You have access to all premium features including unlimited games, custom music uploads, and priority support.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4">
                          <p className="text-sm text-yellow-700 mb-1">Renewal Date</p>
                          <p className="font-semibold text-yellow-900">
                            {user.premiumExpiry ? new Date(user.premiumExpiry).toLocaleDateString('en-GB') : 'Unknown'}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                          <p className="text-sm text-yellow-700 mb-1">Monthly Fee</p>
                          <p className="font-semibold text-yellow-900">£9.99</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Free Member</h3>
                        <p className="text-blue-700 mb-4">
                          You're currently on the free plan. Upgrade to Premium for unlimited access and exclusive features.
                        </p>
                      </div>

                      {/* Pricing Card */}
                      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 px-4 py-2 rounded-bl-2xl font-bold text-sm">
                          BEST VALUE
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Premium Membership</h3>
                        <div className="text-4xl font-bold mb-6">£9.99<span className="text-lg font-normal">/month</span></div>
                        
                        <ul className="space-y-3 mb-8">
                          <li className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                            <span>Unlimited access to all games</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                            <span>Upload custom music tracks</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                            <span>Ad-free gaming experience</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                            <span>Priority customer support</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                            <span>Exclusive premium content</span>
                          </li>
                        </ul>

                        <button
                          onClick={upgradeSubscription}
                          className="w-full bg-yellow-400 text-blue-900 font-bold py-3 px-6 rounded-xl hover:bg-yellow-300 transition-all duration-200 shadow-lg"
                        >
                          Upgrade to Premium
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Music Tab */}
            {activeTab === 'music' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Music Management</h2>
                  
                  {user.subscriptionStatus === 'premium' ? (
                    <div className="space-y-6">
                      {/* Upload Section */}
                      <div className="bg-blue-50 rounded-2xl p-6 border-2 border-dashed border-blue-300">
                        <div className="text-center">
                          <CloudArrowUpIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">Upload Custom Music</h3>
                          <p className="text-blue-600 mb-4">Upload your own music tracks to use during gameplay</p>
                          
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="music-upload"
                            disabled={uploading}
                          />
                          <label
                            htmlFor="music-upload"
                            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white ${
                              uploading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-900 hover:bg-blue-800 cursor-pointer'
                            } transition-colors`}
                          >
                            {uploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                Select Audio File
                              </>
                            )}
                          </label>
                          <p className="text-sm text-blue-500 mt-2">Maximum file size: 5MB</p>
                        </div>
                      </div>

                      {/* Uploaded Music List */}
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Music Library</h3>
                        {user.uploadedMusic && user.uploadedMusic.length > 0 ? (
                          <div className="space-y-3">
                            {user.uploadedMusic.map((track: any, index: number) => (
                              <div key={index} className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                  <MusicalNoteIcon className="h-8 w-8 text-blue-600 mr-3" />
                                  <div>
                                    <p className="font-semibold text-blue-900">{track.name}</p>
                                    <p className="text-sm text-blue-600">Uploaded {track.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    Active
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <MusicalNoteIcon className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                            <p className="text-blue-600">No music uploaded yet. Upload your first track above!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
                        <StarIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Premium Feature</h3>
                        <p className="text-blue-600 mb-6">
                          Upload custom music tracks to personalise your gaming experience. 
                          Upgrade to Premium to unlock this feature.
                        </p>
                        <button
                          onClick={() => setActiveTab('subscription')}
                          className="btn-primary"
                        >
                          View Premium Plans
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Game Progress</h2>
                  
                  {user.gameProgress && Object.keys(user.gameProgress).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(user.gameProgress).map(([gameId, progress]: [string, any]) => (
                        <div key={gameId} className="bg-blue-50 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-blue-900">Game {gameId}</h3>
                            <span className="text-sm text-blue-600">Level {progress.currentLevel || 1}</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-blue-800 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((progress.currentLevel || 1) / 10 * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-sm text-blue-600">Score</p>
                              <p className="text-lg font-bold text-blue-900">{progress.score || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-blue-600">Questions</p>
                              <p className="text-lg font-bold text-blue-900">{progress.questionsAnswered || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-blue-600">Correct</p>
                              <p className="text-lg font-bold text-blue-900">{progress.correctAnswers || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-blue-600">Accuracy</p>
                              <p className="text-lg font-bold text-blue-900">
                                {progress.questionsAnswered ? Math.round((progress.correctAnswers || 0) / progress.questionsAnswered * 100) : 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrophyIcon className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-blue-900 mb-4">No Progress Yet</h3>
                      <p className="text-blue-600 mb-6">Start playing games to track your progress and achievements.</p>
                      <button
                        onClick={() => router.push('/')}
                        className="btn-primary"
                      >
                        Explore Games
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={user.fullName}
                            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            value={user.email}
                            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                          <div>
                            <p className="font-medium text-blue-900">Sound Effects</p>
                            <p className="text-sm text-blue-600">Enable audio feedback during gameplay</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                          <div>
                            <p className="font-medium text-blue-900">Email Notifications</p>
                            <p className="text-sm text-blue-600">Receive updates about new games and features</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-blue-200">
                      <button className="bg-blue-900 text-white py-3 px-6 rounded-xl hover:bg-blue-800 transition-colors font-semibold">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-red-700 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 