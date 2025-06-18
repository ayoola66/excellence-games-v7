'use client'

import Image from 'next/image'
import { useState } from 'react'
import { PencilIcon, TrashIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  isActive: boolean
  totalQuestions: number
  thumbnail?: string | null
  updatedAt: string
}

interface GameCardProps {
  game: Game
  onEdit: (game: Game) => void
  onDelete: (id: string) => void
  onManageQuestions: (id: string) => void
}

export default function GameCard({ game, onEdit, onDelete, onManageQuestions }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Format date to be more readable
  const formattedDate = new Date(game.updatedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video">
        {game.thumbnail ? (
          <Image
            src={game.thumbnail}
            alt={game.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.error('Error loading thumbnail for game:', game.id, game.name);
              // Replace with fallback on error
              e.currentTarget.style.display = 'none';
              // Force a re-render to show the fallback
              setIsHovered(isHovered);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
            <span className="text-blue-500 font-bold text-xl">{game.name.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            game.status === 'premium' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {game.status === 'premium' ? 'Premium' : 'Free'}
          </span>
        </div>

        {/* Activity badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            game.isActive 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {game.isActive ? 'Active' : 'Draft'}
          </span>
        </div>
        
        {/* Hover overlay with actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-3">
            <button
              onClick={() => onEdit(game)}
              className="p-2 bg-white rounded-full hover:bg-blue-50"
              title="Edit game"
            >
              <PencilIcon className="h-5 w-5 text-blue-600" />
            </button>
            <button
              onClick={() => onManageQuestions(game.id)}
              className="p-2 bg-white rounded-full hover:bg-purple-50"
              title="Manage questions"
            >
              <QuestionMarkCircleIcon className="h-5 w-5 text-purple-600" />
            </button>
            <button
              onClick={() => onDelete(game.id)}
              className="p-2 bg-white rounded-full hover:bg-red-50"
              title="Delete game"
            >
              <TrashIcon className="h-5 w-5 text-red-600" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{game.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{game.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              game.type === 'straight' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {game.type === 'straight' ? 'Linear' : 'Nested'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-medium">{game.totalQuestions} Questions</span>
            <span>Updated {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 