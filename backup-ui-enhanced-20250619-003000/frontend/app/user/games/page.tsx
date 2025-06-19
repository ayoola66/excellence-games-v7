"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { strapiApi } from "@/lib/strapiApi";
import { useAuth } from "@/context/AuthContext";

interface User {
  premium?: boolean;
}

export default function UserGamesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [userIsPremium, setUserIsPremium] = useState(false);

  useEffect(() => {
    const fetchUserAndGames = async () => {
      try {
        if (user) {
          // Set premium status from user context
          setUserIsPremium(user.subscriptionStatus === 'premium' || false);
          
          // Fetch games
          const response = await strapiApi.getGames();
          if (response?.data) {
            setGames(response.data);
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserAndGames();
    } else if (!loading) {
      router.push('/login?from=/user/games');
    }
  }, [user, router]);

  const filteredGames = games.filter((game) => {
    const gameAttributes = game.attributes;
    if (filter === 'all') return true;
    return gameAttributes.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading games...</div>
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
            const gameAttributes = game.attributes;
            const isPremium = gameAttributes.status === 'premium';
            const thumbnailUrl = gameAttributes.thumbnail?.data?.attributes?.url || '/placeholder-game.jpg';
            
            return (
              <div 
                key={game.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="relative h-40">
                  <img 
                    src={thumbnailUrl} 
                    alt={gameAttributes.name} 
                    className="w-full h-full object-cover"
                  />
                  {isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Premium
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{gameAttributes.name}</h2>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {gameAttributes.description || 'No description available.'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="mr-3">
                      Type: {gameAttributes.type === 'linear' ? 'Linear' : 'Nested'}
                    </span>
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