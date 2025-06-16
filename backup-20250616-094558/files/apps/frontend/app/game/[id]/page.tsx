'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import StraightGame from '@/components/games/StraightGame'
import NestedGame from '@/components/games/NestedGame'

// Common game interface
interface BaseGame {
  id: string
  name: string
  description: string
  status: 'free' | 'premium'
  totalQuestions: number
}

// Game type-specific interfaces
interface StraightGameType extends BaseGame {
  type: 'straight'
  categories: never[]
}

interface NestedGameType extends BaseGame {
  type: 'nested'
  categories: Array<{
    id: string
    name: string
    description?: string
    cardNumber?: number
    questionCount: number
  }>
}

type Game = StraightGameType | NestedGameType

export default function GamePage() {
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const gameId = params.id as string

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if(!authLoading){
      fetchGame()
    }
  }, [gameId, authLoading])

  const fetchGame = async () => {
    try {
      const response = await axios.get(`/api/games/${gameId}`, { withCredentials: true })
      const gameData = response.data.data

      // Check premium access
      if (gameData.status === 'premium' && user?.subscriptionStatus !== 'premium') {
        setError('Premium subscription required for this game')
        toast.error('Premium subscription required for this game')
        return
      }

      setGame(gameData)
    } catch (error: any) {
      console.error('Error fetching game:', error)
      const rawErr = error.response?.data?.error
      const errorMessage = typeof rawErr === 'string' ? rawErr : rawErr?.message || 'Failed to load game'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Game Not Found'}
          </h2>
          <a href={user ? '/user/dashboard' : '/'} className="text-blue-600 hover:text-blue-800">
            Return to Games
          </a>
        </div>
      </div>
    )
  }

  // Render the appropriate game component based on type
  return game.type === 'straight' ? (
    <StraightGame gameId={gameId} initialGame={game as StraightGameType} />
  ) : (
    <NestedGame gameId={gameId} initialGame={game as any} />
  )
}