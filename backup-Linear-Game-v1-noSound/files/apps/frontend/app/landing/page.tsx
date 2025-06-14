'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import GameCard from '@/components/GameCard'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Game {
  id: string
  attributes: {
    name: string
    description: string
    type: 'straight' | 'nested'
    status: 'free' | 'premium'
    totalQuestions: number
    categories: any[]
    isActive: boolean
  }
}

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await axios.get('/api/games')
      console.log('Games API response:', response.data) // Debug log
      
      if (response.data?.data) {
        // Ensure we're getting the correct data structure
        const gamesData = Array.isArray(response.data.data) ? response.data.data : []
        setGames(gamesData)
      } else {
        console.warn('No games data in response:', response.data)
        setGames([])
        toast.error('No games available')
      }
    } catch (error: any) {
      console.error('Error fetching games:', error)
      const errorMessage = error.response?.data?.error || 'Failed to load games'
      toast.error(errorMessage)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Elite Games</h1>
          <p className="text-xl text-gray-600">Choose a game to start playing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <GameCard 
              key={game.id} 
              game={game}
              onPlay={() => handlePlay(game.id)}
              onFavorite={() => handleFavorite(game.id)}
              isFavorite={favorites.has(game.id)}
            />
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">No games available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
} 