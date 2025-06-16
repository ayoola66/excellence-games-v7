'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  TrophyIcon,
  StarIcon,
  MusicalNoteIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function UserDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-900">Welcome back, {user.fullName || user.username}!</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-blue-800">
          <TrophyIcon className="h-12 w-12 text-blue-700 mx-auto mb-4" />
          <div className="text-3xl font-bold text-blue-900 mb-2">
            {Object.keys(user.gameProgress || {}).length}
          </div>
          <p className="text-blue-600 font-medium">Games Played</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-yellow-400">
          <StarIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-blue-900 mb-2">
            {(user as any).totalScore || 0}
          </div>
          <p className="text-blue-600 font-medium">Total Score</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-indigo-400">
          <MusicalNoteIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
          <div className="text-3xl font-bold text-blue-900 mb-2">
            {(user as any).uploadedMusic?.length || 0}
          </div>
          <p className="text-blue-600 font-medium">Music Tracks</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-blue-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {(user as any).gameProgress && Object.keys((user as any).gameProgress).length > 0 ? (
            Object.entries((user as any).gameProgress).slice(0, 3).map(([gameId, progress]: [string, any]) => (
              <div key={gameId} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <PlayIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-blue-900">Game {gameId}</p>
                    <p className="text-sm text-blue-600">Progress: {progress.currentLevel || 1}</p>
                  </div>
                </div>
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <TrophyIcon className="h-16 w-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-4">No Progress Yet</h3>
              <p className="text-blue-600 mb-6">Start playing games to track your progress and achievements.</p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Explore Games
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 