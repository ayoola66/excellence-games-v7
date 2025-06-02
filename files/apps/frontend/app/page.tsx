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
  RocketLaunchIcon,
  FireIcon,
  BoltIcon,
  GlobeAltIcon,
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
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Elite Games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 backdrop-blur-xl">
        <div className="container-main">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl mr-4 shadow-lg">
                <RocketLaunchIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Elite Games
                </h1>
                <p className="text-xs text-blue-600 font-semibold tracking-wide">
                  PREMIUM TRIVIA PLATFORM
                </p>
              </div>
            </motion.div>
            
            {/* Navigation Actions */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.fullName}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      {user.subscriptionStatus === 'premium' ? (
                        <span className="badge-premium text-xs">
                          <StarIcon className="h-3 w-3 mr-1" /> Premium
                        </span>
                      ) : (
                        <span className="badge-info text-xs">Free Member</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push('/profile')}
                      className="btn-ghost"
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      Profile
                    </button>
                    <button 
                      onClick={() => router.push('/admin')}
                      className="btn-primary"
                    >
                      <CogIcon className="h-4 w-4 mr-2" />
                      Admin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="btn-ghost"
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
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section - Redesigned */}
      <section className="relative pt-20 gradient-hero text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full filter blur-3xl animate-bounce-gentle"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full filter blur-3xl animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container-main relative">
          <div className="section-padding text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Hero Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <BoltIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-semibold">Britain's #1 Premium Trivia Platform</span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="heading-1 text-white mb-8 text-shadow-lg">
                Challenge Your Mind with
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  Elite Trivia Games
                </span>
              </h1>
              
              {/* Subheading */}
              <p className="body-large text-blue-100 max-w-4xl mx-auto mb-12">
                Experience the finest British trivia entertainment with our sophisticated question database. 
                From straight categories to innovative nested card games, discover knowledge like never before.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                {!user && (
                  <>
                    <motion.button 
                      onClick={() => setShowRegisterModal(true)}
                      className="btn-accent text-lg px-8 py-4 shadow-2xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PlayIcon className="h-6 w-6 mr-2" />
                      Start Playing Free
                    </motion.button>
                    <motion.button 
                      onClick={() => router.push('/landing')}
                      className="glass text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GlobeAltIcon className="h-6 w-6 mr-2" />
                      Explore Board Games
                    </motion.button>
                  </>
                )}
              </div>

              {/* Stats Row */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-8 glass rounded-2xl p-8 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-blue-200 text-sm font-medium">Premium Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">50K+</div>
                  <div className="text-blue-200 text-sm font-medium">Active Players</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">98%</div>
                  <div className="text-blue-200 text-sm font-medium">Satisfaction Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-blue-200 text-sm font-medium">Support Available</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Games Section - Enhanced */}
      <section className="section-padding gradient-primary">
        <div className="container-main">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 badge-info mb-4">
              <FireIcon className="h-4 w-4" />
              Featured Games
            </div>
            <h2 className="heading-2 text-gray-900 mb-6">
              Choose Your Challenge
            </h2>
            <p className="body-large max-w-3xl mx-auto">
              From straight trivia to innovative nested card games, find the perfect challenge 
              that matches your expertise and interests.
            </p>
          </motion.div>

          {gamesLoading ? (
            <div className="grid-responsive">
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="card-elevated"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="h-48 bg-gray-200 shimmer"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 shimmer rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 shimmer rounded w-full"></div>
                    <div className="h-3 bg-gray-200 shimmer rounded w-2/3"></div>
                    <div className="h-10 bg-gray-200 shimmer rounded"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="grid-responsive">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <SparklesIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="heading-3 text-gray-900 mb-4">
                Exciting Games Coming Soon
              </h3>
              <p className="body-normal mb-8">
                Our expert team is crafting amazing trivia experiences. Be the first to know when they launch!
              </p>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="btn-primary"
              >
                Join Waitlist
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section - Modernized */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-2 text-gray-900 mb-6">
              Why Choose Elite Games?
            </h2>
            <p className="body-large max-w-3xl mx-auto">
              Experience the pinnacle of British trivia entertainment with features designed for excellence.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: BoltIcon,
                title: "Lightning-Fast Gameplay",
                description: "Instant feedback, seamless navigation, and real-time scoring keep you engaged from start to finish."
              },
              {
                icon: TrophyIcon,
                title: "Premium Content",
                description: "Carefully curated questions by British experts with detailed explanations and contextual learning."
              },
              {
                icon: UserGroupIcon,
                title: "Community Features",
                description: "Join thousands of trivia enthusiasts, compete on leaderboards, and track your progress over time."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="heading-3 text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="body-normal">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Trust Badge */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 glass-dark px-8 py-4 rounded-full">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                Proudly Made in the United Kingdom
              </span>
            </div>
          </motion.div>
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