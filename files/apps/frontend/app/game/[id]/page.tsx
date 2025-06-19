'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import compatToast from '@/lib/notificationManager';
import StraightGame from '@/components/games/StraightGame'
import NestedGame from '@/components/games/NestedGame'
import { useAuth } from '@/context/AuthContext'

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

interface GamePageProps {
  params: {
    id: string;
  };
}

export default function GamePage({ params }: GamePageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        if (user) {
          const response = await api.get(`/games/${params.id}`);
          setGame(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching game:', err);
        
        // Handle specific error cases
        if (err.response?.status === 403) {
          setError('You need a premium subscription to access this game.');
        } else if (err.response?.status === 404) {
          setError('Game not found.');
        } else {
          setError('Unable to load game. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchGame();
    } else if (!authLoading) {
      router.push(`/login?from=/game/${params.id}`);
    }
  }, [params.id, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 max-w-md w-full">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/user/games')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Games
        </button>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  // Game data is available, render the game UI
  const gameData = game.data || game;
  const gameAttributes = gameData.attributes || gameData;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{gameAttributes.name}</h1>
      
      {gameAttributes.description && (
        <p className="text-gray-700 mb-6">{gameAttributes.description}</p>
      )}

      {/* Game content would go here */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Game Content</h2>
        
        {/* Display game based on type */}
        {gameAttributes.type === 'linear' ? (
          <div>
            {/* Linear game UI */}
            <p>Linear game content would be displayed here</p>
          </div>
        ) : (
          <div>
            {/* Nested game UI */}
            <p>Nested game with categories would be displayed here</p>
          </div>
        )}
      </div>
    </div>
  );
}