'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import GameCard from '@/components/GameCard'
import axios from 'axios'
import compatToast from '@/lib/notificationManager';

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

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const { data: games = [], isLoading: loading } = useQuery({
    queryKey: ['games'],
    queryFn: () => {
      return axios.get('/api/games').then(response => {
        console.log('Games API response:', response.data)
        return Array.isArray(response.data?.data) ? response.data.data : []
      }).catch(error => {
        console.error('Error fetching games:', error)
        const errorMessage = error.response?.data?.error || 'Failed to load games'
        compatToast.error(errorMessage)
        return []
      })
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const handlePlay = (gameId: string) => {
    router.push(`/game/${gameId}`)
  }

  const handleFavorite = (gameId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(gameId)) {
        newFavorites.delete(gameId)
      } else {
        newFavorites.add(gameId)
      }
      return newFavorites
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={favorites.has(game.id)}
            onPlay={() => handlePlay(game.id)}
            onFavorite={() => handleFavorite(game.id)}
          />
        ))}
      </div>
    </div>
  )
} 