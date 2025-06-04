'use client'

import { useState, useEffect } from 'react'

interface Game {
  id: string
  name: string
  type: 'straight' | 'nested'
}

export default function DropdownTest() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  useEffect(() => {
    // Simulate loading games
    setGames([
      { id: '1', name: 'Science - Free', type: 'straight' },
      { id: '2', name: 'Science', type: 'nested' }
    ])
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-bold mb-4">Dropdown Test</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Game (Debug Version)
        </label>
        <select
          value={selectedGame?.id || ''}
          onChange={(e) => {
            console.log('🔧 Test dropdown changed:', e.target.value)
            const gameId = e.target.value
            if (gameId === '') {
              setSelectedGame(null)
            } else {
              const game = games.find(g => g.id === gameId)
              setSelectedGame(game || null)
              console.log('🔧 Test game selected:', game)
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a game...</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name} ({game.type === 'nested' ? 'Card Game' : 'Straight Quiz'})
            </option>
          ))}
        </select>
        
        {selectedGame && (
          <p className="mt-2 text-sm text-green-600">
            ✅ Selected: {selectedGame.name} (ID: {selectedGame.id})
          </p>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        <p><strong>Games loaded:</strong> {games.length}</p>
        <p><strong>Selected game ID:</strong> {selectedGame?.id || 'None'}</p>
        <p><strong>Selected game name:</strong> {selectedGame?.name || 'None'}</p>
      </div>
    </div>
  )
} 