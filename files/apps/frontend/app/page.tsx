'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import GameCard from '@/components/GameCard'
import LoginModal from '@/components/LoginModal'
import RegisterModal from '@/components/RegisterModal'
import { useAuth } from '@/context/AuthContext'
import { strapiApi } from '@/lib/strapiApi'
import { useRouter } from 'next/navigation'
import {
  PlayIcon,
  TrophyIcon,
  MusicalNoteIcon,
  SparklesIcon,
  UserGroupIcon,
  LockClosedIcon,
  StarIcon,
  UserIcon,
  CogIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Game {
  id: string
  attributes: {
    name: string
    description: string
    type: 'straight' | 'nested'
    status: 'free' | 'premium'
    totalQuestions: number
    thumbnail?: {
      data?: {
        attributes: {
          url: string
          name: string
        }
      }
    }
    categories?: any[]
  }
}

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      setGamesLoading(true)
      const response = await strapiApi.getGames()
      setGames(response.data || [])
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('Failed to load games')
    } finally {
      setGamesLoading(false)
    }
  }

  const getGameAccessType = (game: Game) => {
    if (!user) return 'login'
    if (game.attributes.status === 'free') return 'free'
    if (user.subscriptionStatus === 'premium') return 'free'
    return 'locked'
  }

  const getGameCategoriesData = (game: Game) => {
    if (game.attributes.type === 'straight') {
      return game.attributes.categories?.map((cat: any, index: number) => ({
        id: cat.id || `cat-${index}`,
        name: cat.attributes?.name || cat.name || `Category ${index + 1}`,
        questionCount: cat.attributes?.questionCount || cat.questionCount || 0
      })) || []
    } else {
      // For nested games, return card-based structure
      return game.attributes.categories?.map((cat: any, index: number) => ({
        id: cat.id || `card-${index}`,
        name: cat.attributes?.name || cat.name || `Card ${index + 1}`,
        questionCount: cat.attributes?.questionCount || cat.questionCount || 0,
        cardNumber: cat.attributes?.cardNumber || cat.cardNumber || index + 1
      })) || []
    }
  }

  const openLoginModal = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const openRegisterModal = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="bg-blue-900 p-2 rounded-xl mr-4">
                <PlayIcon className="h-8 w-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Elite Games</h1>
                <p className="text-xs text-blue-600 font-medium">Premium Trivia Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-blue-800 font-medium">
                    Welcome back, {user.fullName}
                  </span>
                  {user.subscriptionStatus === 'premium' && (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full border border-yellow-600 shadow-sm flex items-center gap-1">
                      <StarIcon className="h-3 w-3" /> Premium
                    </span>
                  )}
                  <button 
                    onClick={() => router.push('/profile')}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </button>
                  <button 
                    onClick={() => router.push('/admin')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CogIcon className="h-4 w-4" />
                    Admin
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="btn-secondary"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="btn-primary"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-7xl font-bold mb-8 text-shadow leading-tight">
              Challenge Your Mind with 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300"> Elite Trivia</span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-blue-100">
              Discover engaging trivia games with straight categories and nested card challenges. 
              Test your knowledge across various topics with our premium British question database.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user && (
                <>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-xl hover:bg-yellow-300 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
                  >
                    Start Playing Free
                  </button>
                  <button 
                    onClick={() => router.push('/landing')}
                    className="bg-white/10 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg"
                  >
                    Buy Board Game
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-blue-900 mb-6">
              Choose Your Challenge
            </h3>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto leading-relaxed">
              From straight trivia to nested card games, find the perfect challenge for your skill level.
            </p>
          </div>

          {gamesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="game-card animate-pulse">
                  <div className="h-48 bg-blue-200 rounded-t-2xl"></div>
                  <div className="p-6">
                    <div className="h-4 bg-blue-200 rounded mb-2"></div>
                    <div className="h-3 bg-blue-200 rounded mb-4"></div>
                    <div className="h-8 bg-blue-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </div>
          )}

          {games.length === 0 && !gamesLoading && (
            <div className="text-center py-16">
              <CogIcon className="h-20 w-20 text-blue-300 mx-auto mb-6" />
              <h4 className="text-2xl font-bold text-blue-900 mb-4">
                No Games Available
              </h4>
              <p className="text-blue-600 text-lg">
                Games are being prepared. Please check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6">
              Why Choose Elite Games?
            </h3>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Experience the finest in British trivia entertainment with our premium features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center group"
            >
              <div className="bg-yellow-400 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <PlayIcon className="h-10 w-10 text-blue-900" />
              </div>
              <h4 className="text-2xl font-bold mb-4">Engaging Gameplay</h4>
              <p className="text-blue-200 leading-relaxed">
                Interactive questions with immediate feedback and detailed explanations to enhance your learning.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center group"
            >
              <div className="bg-yellow-400 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <StarIcon className="h-10 w-10 text-blue-900" />
              </div>
              <h4 className="text-2xl font-bold mb-4">Premium Features</h4>
              <p className="text-blue-200 leading-relaxed">
                Access all games, upload custom music, enjoy ad-free experience, and unlock exclusive content.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center group"
            >
              <div className="bg-yellow-400 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <CheckCircleIcon className="h-10 w-10 text-blue-900" />
              </div>
              <h4 className="text-2xl font-bold mb-4">Progress Tracking</h4>
              <p className="text-blue-200 leading-relaxed">
                Track your performance, see detailed statistics, and monitor your improvement over time.
              </p>
            </motion.div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Made with pride in the United Kingdom</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false)
            setShowRegisterModal(true)
          }}
        />
      )}
      
      {showRegisterModal && (
        <RegisterModal 
          isOpen={showRegisterModal} 
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false)
            setShowLoginModal(true)
          }}
        />
      )}
    </div>
  )
}