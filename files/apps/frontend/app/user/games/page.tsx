"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface Game {
  id: string;
  name: string;
  description: string;
  type: string;
  status?: string;
  thumbnail?: string | null;
  categories: Array<{ id: string; name: string }>;
  totalQuestions?: number;
}

export default function UserGamesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [userIsPremium, setUserIsPremium] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        if (user) {
          // Set premium status from user context
          setUserIsPremium(user.subscriptionStatus === 'premium' || false);
          
          // Fetch games from our new API route
          const res = await fetch("/api/games", {
            credentials: 'include' // Important for sending cookies
          });

          if (res.status === 401) {
            router.push('/login?from=/user/games');
            return;
          }

          if (!res.ok) {
            throw new Error("Failed to fetch games");
          }

          const { data, error } = await res.json();
          
          if (error) {
            throw new Error(error);
          }

          setGames(data || []);
        }
      } catch (err: any) {
        console.error('Error fetching games:', err);
        setError(err.message || 'Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchGames();
    } else if (!loading) {
      router.push('/login?from=/user/games');
    }
  }, [user, router]);

  const filteredGames = games.filter((game) => {
    if (filter === 'all') return true;
    return game.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <div className="ml-3 text-lg">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Games</h1>
        
        <Link 
          href="/user/profile" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          My Profile
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('all')}
          >
            All Games
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === 'free' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('free')}
          >
            Free Games
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === 'premium' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('premium')}
          >
            Premium Games
          </button>
        </div>
      </div>
      
      {filteredGames.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-500">No games found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const isPremium = game.status === 'premium';
            
            return (
              <div 
                key={game.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="relative h-40">
                  {game.thumbnail ? (
                    <Image 
                      src={game.thumbnail} 
                      alt={game.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  {isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Premium
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{game.name}</h2>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {game.description || 'No description available.'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="mr-3">
                      Type: {game.type === 'linear' ? 'Linear' : 'Nested'}
                    </span>
                    {game.totalQuestions !== undefined && (
                      <span>
                        Questions: {game.totalQuestions}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href={`/game/${game.id}`}
                    className={`w-full block text-center py-2 px-4 rounded-md ${
                      isPremium && !userIsPremium
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    onClick={(e) => {
                      if (isPremium && !userIsPremium) {
                        e.preventDefault();
                        router.push('/user/subscription');
                      }
                    }}
                  >
                    {isPremium && !userIsPremium
                      ? 'Requires Premium'
                      : 'Play Game'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 