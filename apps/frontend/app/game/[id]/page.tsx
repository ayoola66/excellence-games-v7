'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/axios'
import { ASSETS } from '@/lib/constants'
import compatToast from '@/lib/notificationManager'
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
  thumbnail?: string
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

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center min-h-screen">
    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-lg font-medium text-gray-700">Loading game...</p>
  </div>
);

const ErrorDisplay = ({ message, onRetry, onBack }: { message: string, onRetry: () => void, onBack: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col justify-center items-center min-h-screen p-4"
  >
    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-md max-w-md w-full shadow-md">
      <div className="flex items-center">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
      </div>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Back to Games
        </button>
      </div>
    </div>
  </motion.div>
);

export default function GamePage({ params }: GamePageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (user) {
        const response = await api.get(`/games/${params.id}`, {
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
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
      
      compatToast.error('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGame();
    } else if (!authLoading) {
      router.push(`/login?from=/game/${params.id}`);
    }
  }, [params.id, user, authLoading, router]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        message={error} 
        onRetry={fetchGame} 
        onBack={() => router.push('/user/games')} 
      />
    );
  }

  if (!game) {
    return null;
  }

  // Game data is available, render the game UI
  const gameData = game.data || game;
  const gameAttributes = gameData.attributes || gameData;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto p-4 max-w-6xl"
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="relative h-64 md:h-80">
            <Image
              src={gameAttributes.thumbnail || ASSETS.IMAGES.PLACEHOLDER}
              alt={gameAttributes.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold">{gameAttributes.name}</h1>
                {gameAttributes.description && (
                  <p className="mt-2 text-gray-200 max-w-2xl">{gameAttributes.description}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  gameAttributes.status === 'premium' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {gameAttributes.status === 'premium' ? 'Premium' : 'Free'}
                </span>
                <span className="text-gray-600">
                  {gameAttributes.totalQuestions} Questions
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Start Game
              </motion.button>
            </div>
            
            {/* Game content */}
            <div className="bg-gray-50 rounded-lg p-6">
              {/* Display game based on type */}
              {gameAttributes.type === 'straight' ? (
                <StraightGame game={gameAttributes} />
              ) : gameAttributes.type === 'nested' ? (
                <NestedGame game={gameAttributes} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Game type not supported</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}