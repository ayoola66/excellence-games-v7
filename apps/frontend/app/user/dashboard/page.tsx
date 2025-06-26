"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { FullPageLoading, LoadingFallback } from '@/components/ui/LoadingFallback'

interface Game {
  id: string
  name: string
  description: string
  type: string
  status?: string
  thumbnail?: string | null
  categories: Array<{ id: string; name: string }>
  totalQuestions?: number
}

interface UserStats {
  gamesPlayed: number
  gamesCompleted: number
  totalScore: number
  averageScore: number
}

function UserDashboardContent() {
  const router = useRouter()
  const { user, isLoading: authLoading, authError } = useAuth()
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0,
    gamesCompleted: 0,
    totalScore: 0,
    averageScore: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsWarning, setStatsWarning] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      console.log('[UserDashboard] User authenticated, fetching data')
      fetchDashboardData()
    } else {
      console.warn('[UserDashboard] Rendered without a user. ProtectedLayout should have redirected.')
      setError("Could not verify user information. Please try logging in again.")
      setLoading(false)
    }
  }, [user])

  async function fetchDashboardData() {
    setError(null)
    setStatsWarning(null)
    try {
      console.log('[UserDashboard] Fetching dashboard data')
      // Get token from cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('clientUserToken='))
        ?.split('=')[1]

      if (!token) {
        throw new Error('Authentication token not found')
      }

      // Log masked token for debugging
      const maskedToken = token.substring(0, 6) + '...' + token.substring(token.length - 4)
      console.log('[UserDashboard] Using auth token:', maskedToken)

      // Fetch all games
      const gamesRes = await fetch("/api/games", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      })

      if (gamesRes.status === 401) {
        console.warn('[UserDashboard] Unauthorized when fetching games, redirecting to login')
        router.push('/login')
        return
      }

      if (!gamesRes.ok) {
        console.error('[UserDashboard] Failed to fetch games:', gamesRes.status)
        throw new Error("Failed to fetch games from the database")
      }

      const { data: gamesData } = await gamesRes.json()
      
      if (!gamesData || !Array.isArray(gamesData)) {
        console.warn('[UserDashboard] Invalid games data received:', gamesData)
        setRecentGames([])
      } else {
        const formattedGames = gamesData.map((game: any) => ({
          id: game.id,
          name: game.attributes.name,
          description: game.attributes.description,
          type: game.attributes.type,
          status: game.attributes.status,
          thumbnail: game.attributes.thumbnail?.data?.attributes?.url 
            ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${game.attributes.thumbnail.data.attributes.url}`
            : null,
          categories: game.attributes.categories?.data?.map((cat: any) => ({
            id: cat.id,
            name: cat.attributes.name
          })) || [],
          totalQuestions: game.attributes.questions?.data?.length || 0
        }))
        console.log('[UserDashboard] Games data formatted:', formattedGames.length, 'games')
        setRecentGames(formattedGames)
      }

      // Fetch user stats using same token
      const statsRes = await fetch("/api/user/stats", {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      })

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        console.log('[UserDashboard] Stats data received:', statsData)
        setStats(statsData)
      } else {
        console.warn('[UserDashboard] Stats API failed:', statsRes.status)
        setStats({ gamesPlayed: 0, gamesCompleted: 0, totalScore: 0, averageScore: 0 })
        setStatsWarning('Could not load your statistics. This feature may be temporarily unavailable.')
      }
    } catch (err: any) {
      console.error('[UserDashboard] Error fetching dashboard data:', err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <FullPageLoading message="Your session may have expired. Redirecting to login..." />
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingFallback message="Loading your dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{authError}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.fullName || user?.username || 'Player'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Ready to challenge yourself with some exciting games?
        </p>
        {statsWarning && (
          <div className="flex items-centre mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-yellow-600 font-medium mr-2">⚠️</span>
            <span className="text-yellow-700">{statsWarning}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Games Played</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.gamesPlayed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Games Completed</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.gamesCompleted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Score</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">{stats.totalScore}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.averageScore}</p>
        </div>
      </div>

      {/* Games List Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Games</h2>
        {recentGames.length === 0 ? (
          <p className="text-gray-600">No games found in the database. Why not start a new one?</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentGames.map((game) => (
              <div key={game.id} className="bg-gray-50 rounded-xl shadow p-4 flex flex-col">
                {game.thumbnail ? (
                  <Image
                    src={game.thumbnail}
                    alt={game.name + ' thumbnail'}
                    width={320}
                    height={180}
                    className="rounded-lg object-cover mb-3"
                  />
                ) : (
                  <div className="w-full h-[180px] bg-gray-200 rounded-lg flex items-centre justify-centre text-gray-400 mb-3">
                    No image available
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{game.name}</h3>
                <p className="text-gray-700 mb-2 line-clamp-2">{game.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {game.categories.map((cat) => (
                    <span key={cat.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {cat.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-centre justify-between text-sm text-gray-500 mt-auto">
                  <span>Type: {game.type}</span>
                  <span>Questions: {game.totalQuestions}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboardContent 