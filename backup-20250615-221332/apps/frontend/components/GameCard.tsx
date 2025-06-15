'use client'

import { motion } from 'framer-motion'
import { PlayIcon, LockClosedIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import Image from 'next/image'

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
  onPlay: () => void
  onFavorite: () => void
  isFavorite: boolean
}

export default function GameCard({ game, onPlay, onFavorite, isFavorite }: GameCardProps) {
  // Add error handling for undefined game or attributes
  if (!game || !game.attributes) {
    console.warn('Invalid game data:', game)
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
        <p className="text-red-600">Error: Invalid game data</p>
      </div>
    )
  }

  const { name, description, type, status, thumbnail } = game.attributes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Game Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {thumbnail?.data?.attributes?.url ? (
          <Image
            src={thumbnail.data.attributes.url}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayIcon className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        {status === 'premium' && (
          <div className="absolute top-4 right-4 bg-yellow-500 rounded-full p-2">
            <LockClosedIcon className="h-4 w-4 text-white" />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite()
          }}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
        >
          {isFavorite ? (
            <HeartSolid className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              type === 'straight'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {type === 'straight' ? 'Linear' : 'Nested'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'free'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {status === 'free' ? 'Free' : 'Premium'}
            </span>
          </div>
          
          <button
            onClick={onPlay}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlayIcon className="h-4 w-4" />
            <span>Play</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}