'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import { toast } from 'react-hot-toast';

export default function AdminGamesPage() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const response = await strapiApi.getAdminGames();
      setGames(response.data);
    } catch (err) {
      setError('Failed to fetch games.');
      toast.error('Failed to fetch games.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) return;
    try {
      await strapiApi.deleteGame(id);
      setGames(games.filter(g => g.id !== id));
      toast.success('Game deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete game.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Games Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        onClick={() => router.push('/admin/games/new')}
      >
        Add New Game
      </button>
      {isLoading ? (
        <div>Loading games...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td className="border px-4 py-2">{game.name}</td>
                <td className="border px-4 py-2">{game.type}</td>
                <td className="border px-4 py-2">{game.status}</td>
                <td className="border px-4 py-2">
                  <button
                    className="mr-2 text-blue-700 underline"
                    onClick={() => router.push(`/admin/games/${game.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="mr-2 text-green-700 underline"
                    onClick={() => router.push(`/admin/games/${game.id}/categories`)}
                  >
                    Categories
                  </button>
                  <button
                    className="mr-2 text-purple-700 underline"
                    onClick={() => router.push(`/admin/games/${game.id}/questions`)}
                  >
                    Questions
                  </button>
                  <button
                    className="text-red-700 underline"
                    onClick={() => handleDelete(game.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 