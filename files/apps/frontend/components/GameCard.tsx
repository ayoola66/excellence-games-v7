'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { PlayIcon, LockClosedIcon, StarIcon } from '@heroicons/react/24/solid'

interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  thumbnail?: any
  totalQuestions: number
  accessType: 'free' | 'full' | 'locked'
}

export default function GameCard({ game }: { game: Game }) {
  const router = useRouter()
  const isPremium = game.status === 'premium'
  const isLocked = game.accessType === 'locked'

  return (
    <div
      className={`game-card flex flex-col h-full relative group ${isPremium ? 'border-yellow-400' : ''}`}
    >
      <div className="relative h-48 w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
        {game.thumbnail ? (
          <img
            src={typeof game.thumbnail === 'string' ? game.thumbnail : game.thumbnail.url}
            alt={game.name}
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
      </div>
      <div className="flex-1 flex flex-col p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors">
          {game.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {game.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-gray-500">
            {game.totalQuestions} questions
          </span>
          <button
            className={`btn-primary flex items-center gap-2 text-sm px-4 py-2 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLocked}
            onClick={() => router.push(`/game/${game.id}`)}
            aria-label={isLocked ? 'Locked' : 'Play game'}
          >
            <PlayIcon className="h-5 w-5" />
            {isLocked ? 'Locked' : 'Play'}
          </button>
        </div>
      </div>
    </div>
  )
}