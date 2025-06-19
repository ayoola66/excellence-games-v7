'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';

interface Category {
  id: string;
  name: string;
  description: string;
  cardNumber?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function GameCategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [categories, setCategories] = useState<Category[]>([]);
  const [gameName, setGameName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await strapiApi.getGame(id as string);
      const game = response.data;
      setGameName(game.attributes?.name || '');
      const cats = game.attributes?.categories?.data || [];
      setCategories(cats.map((cat: any) => ({
        id: cat.id,
        ...cat.attributes
      })));
    } catch (err) {
      setError('Failed to fetch categories.');
      compatToast.error('Failed to fetch categories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (catId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
    try {
      await strapiApi.deleteCategory(catId);
      setCategories(categories.filter(c => c.id !== catId));
      compatToast.success('Category deleted successfully.');
    } catch (err) {
      compatToast.error('Failed to delete category.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Categories for Game: {gameName}</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        onClick={() => router.push(`/admin/games/${id}/categories/new`)}
      >
        Add New Category
      </button>
      <button
        className="mb-4 ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        onClick={() => router.push('/admin/games')}
      >
        Back to Games
      </button>
      {isLoading ? (
        <div>Loading categories...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Card Number</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat: Category) => (
              <tr key={cat.id}>
                <td className="border px-4 py-2">{cat.name}</td>
                <td className="border px-4 py-2">{cat.description}</td>
                <td className="border px-4 py-2">{cat.cardNumber || '-'}</td>
                <td className="border px-4 py-2">
                  <button
                    className="mr-2 text-blue-700 underline"
                    onClick={() => router.push(`/admin/games/${id}/categories/${cat.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="mr-2 text-purple-700 underline"
                    onClick={() => router.push(`/admin/games/${id}/categories/${cat.id}/questions`)}
                  >
                    Questions
                  </button>
                  <button
                    className="text-red-700 underline"
                    onClick={() => handleDelete(cat.id)}
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