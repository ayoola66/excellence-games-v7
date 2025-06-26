"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function MyGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/games", {
          credentials: 'include' // Important for sending cookies
        });

        if (res.status === 401) {
          console.log('Unauthorized - Redirecting to login');
          router.push('/login');
          return;
        }

        if (res.status === 503) {
          throw new Error("Unable to connect to the game server. Please try again later.");
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.details || "Failed to fetch games");
        }

        const { data, error } = await res.json();
        
        if (error) {
          throw new Error(error);
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format from server");
        }

        setGames(data);
      } catch (err: any) {
        const errorMessage = err.message || "Unknown error occurred while loading games";
        setError(errorMessage);
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, [router]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    router.refresh(); // This will trigger a re-render and re-fetch
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Games</h1>
      
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading games...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 p-6 rounded-lg max-w-lg mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !games.length && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No games available.</p>
        </div>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {game.thumbnail ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={game.thumbnail}
                    alt={game.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              
              <div className="p-6">
                <div className="text-xl font-bold text-blue-900 mb-2">
                  {game.name}
                </div>
                
                <div className="text-gray-600 mb-4 line-clamp-3">
                  {game.description}
                </div>
                
                <div className="flex gap-2 mb-4">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${game.type === 'linear' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-purple-100 text-purple-700'}
                  `}>
                    {game.type === 'linear' ? 'Linear' : 'Card Game'}
                  </span>
                  
                  {game.status && (
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${game.status === 'premium' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-gray-100 text-gray-700'}
                    `}>
                      {game.status === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  )}
                  
                  {game.totalQuestions !== undefined && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {game.totalQuestions} Questions
                    </span>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/game/${game.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition"
                >
                  Play Game
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 