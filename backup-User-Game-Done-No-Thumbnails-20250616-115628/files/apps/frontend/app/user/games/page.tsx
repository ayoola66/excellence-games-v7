"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Game {
  id: string;
  name: string;
  description: string;
  type: string;
  status?: string;
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
        const res = await fetch("/api/games");
        if (!res.ok) throw new Error("Failed to fetch games");
        const data = await res.json();
        setGames(data.data || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  if (loading) return <div className="text-center py-12">Loading games...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!games.length) return <div className="text-center py-12">No games available.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Games</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition"
          >
            <div>
              <div className="text-xl font-bold text-blue-900 mb-2">{game.name}</div>
              <div className="text-gray-600 mb-4 line-clamp-3">{game.description}</div>
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${game.type === 'straight' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                  {game.type === 'straight' ? 'Linear' : 'Card Game'}
                </span>
                {game.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${game.status === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {game.status === 'premium' ? 'Premium' : 'Free'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push(`/game/${game.id}`)}
              className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition"
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 