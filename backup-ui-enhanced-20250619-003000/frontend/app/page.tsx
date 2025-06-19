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
import compatToast from '@/lib/notificationManager';
import { useQuery } from '@tanstack/react-query'

interface Game {
  id: string
  attributes: {
    name: string
    description: string
    type: 'straight' | 'nested'
    status: 'free' | 'premium'
    totalQuestions: number
    categories?: {
      id: string
      attributes: {
        name: string
        description: string
        questionCount: number
        cardNumber?: number
      }
    }[]
    isActive: boolean
    thumbnail?: {
      data?: {
        attributes: {
          url: string
        }
      }
    }
  }
}

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [favoriteGames, setFavoriteGames] = useState<string[]>([])

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => strapiApi.getGames().then(res => res?.data || []),
    enabled: !isLoading, // Only fetch when auth loading is complete
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const handleToggleFavorite = async (gameId: string) => {
    if (!user) {
      openLoginModal()
      return
    }

    try {
      await strapiApi.toggleFavoriteGame(gameId)
      setFavoriteGames(prev => {
        if (prev.includes(gameId)) {
          return prev.filter(id => id !== gameId)
        } else {
          return [...prev, gameId]
        }
      })
      compatToast.success('Game favorites updated')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      compatToast.error('Failed to update favorites')
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
                <RocketLaunchIcon className="w-icon-md h-icon-md text-white" />
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
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <StarIcon className="w-icon-sm h-icon-sm mr-1" />
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <UserIcon className="w-icon-sm h-icon-sm mr-1" />
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/user/settings"
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <CogIcon className="w-icon-md h-icon-md" />
                  </Link>
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
                <BoltIcon className="w-icon-sm h-icon-sm text-yellow-400" />
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
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user ? (
                  <Link
                    href="/user/dashboard"
                    className="btn-accent"
                  >
                    <PlayIcon className="w-icon-sm h-icon-sm mr-2" />
                    Start Playing
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="btn-accent"
                  >
                    <SparklesIcon className="w-icon-sm h-icon-sm mr-2" />
                    Get Started
                  </button>
                )}
                <Link
                  href="/landing"
                  className="btn-secondary"
                >
                  <TrophyIcon className="w-icon-sm h-icon-sm mr-2" />
                  View Premium Plans
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Featured Games</h2>
            <p className="body-large max-w-3xl mx-auto">
              Explore our curated collection of trivia games, from classic categories to innovative nested card challenges.
            </p>
          </div>

          {gamesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={() => router.push(`/game/${game.id}`)}
                  onFavorite={() => handleToggleFavorite(game.id)}
                  isFavorite={favoriteGames.includes(game.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Why Choose Elite Games?</h2>
            <p className="body-large max-w-3xl mx-auto">
              Experience the finest British trivia platform with features designed for both casual players and serious enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                icon: SparklesIcon,
                title: 'Premium Content',
                description: 'Expertly curated questions and categories, regularly updated with fresh content.'
              },
              {
                icon: MusicalNoteIcon,
                title: 'Audio Integration',
                description: 'Immersive sound effects and background music to enhance your gaming experience.'
              },
              {
                icon: UserGroupIcon,
                title: 'Community Focus',
                description: 'Connect with fellow trivia enthusiasts and compete in friendly challenges.'
              },
              {
                icon: ShieldCheckIcon,
                title: 'British Quality',
                description: 'Developed and maintained with the highest standards of British excellence.'
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
                  <feature.icon className="w-icon-md h-icon-md text-white" />
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
              <ShieldCheckIcon className="w-icon-sm h-icon-sm text-blue-600" />
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