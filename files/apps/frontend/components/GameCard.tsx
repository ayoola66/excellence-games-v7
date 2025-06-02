'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PlayIcon, LockClosedIcon, StarIcon, UserIcon } from '@heroicons/react/24/solid'

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

export default function GameCard({ game }: { game: Game }) {
  const router = useRouter()
  const { user } = useAuth()
  const isPremium = game.attributes.status === 'premium'
  
  // Determine access type based on user status
  const getAccessType = () => {
    if (!user) return 'login'
    if (game.attributes.status === 'free') return 'free'
    if (user.subscriptionStatus === 'premium') return 'free'
    return 'locked'
  }
  
  const accessType = getAccessType()
  const isLocked = accessType === 'locked'
  const needsLogin = accessType === 'login'

  const handleGameClick = () => {
    if (needsLogin) {
      // This could trigger a login modal or redirect to login
      router.push('/login')
      return
    }
    
    if (!isLocked) {
      router.push(`/game/${game.id}`)
    }
  }

  const getThumbnailUrl = () => {
    if (game.attributes.thumbnail?.data?.attributes?.url) {
      const url = game.attributes.thumbnail.data.attributes.url
      // Handle relative URLs from Strapi
      return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${url}`
    }
    return null
  }

  const thumbnailUrl = getThumbnailUrl()

  return (
    <div
      className={`game-card flex flex-col h-full relative group ${isPremium ? 'border-yellow-400' : ''}`}
    >
      <div className="relative h-48 w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={game.attributes.name}
            className="object-cover w-full h-full rounded-t-2xl"
          />
        ) : (
          <PlayIcon className="h-16 w-16 text-blue-400 opacity-60" />
        )}
        {isPremium && (
          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow border border-yellow-500 flex items-center gap-1">
            <StarIcon className="h-4 w-4 mr-1 text-yellow-700" /> Premium
          </span>
        )}
        {isLocked && (
          <span className="absolute top-3 left-3 bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full shadow border border-gray-300 flex items-center gap-1">
            <LockClosedIcon className="h-4 w-4 mr-1 text-gray-500" /> Locked
          </span>
        )}
        {needsLogin && (
          <span className="absolute top-3 left-3 bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full shadow border border-blue-300 flex items-center gap-1">
            <UserIcon className="h-4 w-4 mr-1 text-blue-500" /> Login Required
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors">
          {game.attributes.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {game.attributes.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-gray-500">
            {game.attributes.totalQuestions} questions
          </span>
          <button
            className={`btn-primary flex items-center gap-2 text-sm px-4 py-2 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLocked}
            onClick={handleGameClick}
            aria-label={isLocked ? 'Locked' : needsLogin ? 'Login to play' : 'Play game'}
          >
            <PlayIcon className="h-5 w-5" />
            {isLocked ? 'Locked' : needsLogin ? 'Login to Play' : 'Play'}
          </button>
        </div>
      </div>
    </div>
  )
}