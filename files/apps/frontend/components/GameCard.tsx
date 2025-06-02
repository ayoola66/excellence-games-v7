'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  PlayIcon, 
  LockClosedIcon, 
  StarIcon, 
  QuestionMarkCircleIcon,
  FolderIcon,
  SparklesIcon,
  CheckBadgeIcon,
  BoltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { 
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid'
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

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  const { user } = useAuth()
  const router = useRouter()

  const canPlayGame = () => {
    if (game.attributes.status === 'free') return true
    return user?.subscriptionStatus === 'premium'
  }

  const handlePlayGame = () => {
    if (!user) {
      toast.error('Please sign in to play games')
      return
    }

    if (!canPlayGame()) {
      toast.error('This is a premium game. Please upgrade to access premium content.')
      return
    }

    router.push(`/game/${game.id}`)
  }

  const getGameTypeInfo = () => {
    switch (game.attributes.type) {
      case 'straight':
        return {
          label: 'Straight Trivia',
          description: 'Direct questions across various categories',
          icon: QuestionMarkCircleIcon,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700'
        }
      case 'nested':
        return {
          label: 'Nested Cards',
          description: 'Progressive card-based challenges',
          icon: FolderIcon,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700'
        }
      default:
        return {
          label: 'Unknown',
          description: 'Game type not specified',
          icon: QuestionMarkCircleIcon,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700'
        }
    }
  }

  const typeInfo = getGameTypeInfo()

  return (
    <motion.div 
      className="game-card group cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={handlePlayGame}
    >
      {/* Card Header with Image/Pattern */}
      <div className={`relative h-48 bg-gradient-to-br ${typeInfo.color} overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full filter blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/20 rounded-full filter blur-lg"></div>
        </div>
        
        {/* Game Type Icon */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <typeInfo.icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Game Status Badge */}
        <div className="absolute top-4 right-4">
          {game.attributes.status === 'premium' ? (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <StarIconSolid className="h-3 w-3" />
              Premium
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
              Free
            </div>
          )}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            {canPlayGame() ? (
              <PlayIcon className="h-8 w-8 text-gray-900" />
            ) : (
              <LockClosedIcon className="h-8 w-8 text-gray-700" />
            )}
          </div>
        </div>

        {/* Question Count Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
            <QuestionMarkCircleIcon className="h-3 w-3" />
            {game.attributes.totalQuestions} Questions
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Game Type Label */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.bgColor} ${typeInfo.textColor}`}>
            <typeInfo.icon className="h-3 w-3" />
            {typeInfo.label}
          </span>
          
          {game.attributes.type === 'nested' && (
            <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
              <FolderIcon className="h-3 w-3" />
              5 Categories + Special
            </div>
          )}
        </div>

        {/* Game Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {game.attributes.name}
        </h3>

        {/* Game Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {game.attributes.description}
        </p>

        {/* Game Features */}
        <div className="flex flex-wrap gap-2 mb-6">
          {game.attributes.type === 'straight' && (
            <>
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-medium">
                <BoltIcon className="h-3 w-3" />
                Quick Play
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md font-medium">
                <CheckBadgeIcon className="h-3 w-3" />
                Instant Results
              </span>
            </>
          )}
          
          {game.attributes.type === 'nested' && (
            <>
              <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md font-medium">
                <SparklesIcon className="h-3 w-3" />
                Progressive
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-medium">
                <FolderIcon className="h-3 w-3" />
                Card Based
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          {canPlayGame() ? (
            <button className="btn-primary w-full group-hover:shadow-lg transition-shadow duration-200">
              <PlayIcon className="h-4 w-4 mr-2" />
              Play Game
              <ArrowRightIcon className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          ) : (
            <div className="w-full">
              <button 
                disabled
                className="w-full bg-gray-100 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LockClosedIcon className="h-4 w-4" />
                Premium Required
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Upgrade to unlock premium games
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Hover Indicator */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
    </motion.div>
  )
}