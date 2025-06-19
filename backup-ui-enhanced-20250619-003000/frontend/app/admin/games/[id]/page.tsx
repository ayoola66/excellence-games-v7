'use client';

import React, { useState, useEffect } from 'react';
import { strapiApi } from '@/lib/strapiApi';
import { useRouter } from 'next/navigation';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { QuestionImporter } from '@/components/admin/QuestionImporter';
import Link from 'next/link';

interface GameDetailPageProps {
  params: {
    id: string;
  };
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await strapiApi.getGame(id);
        if (!response?.data) {
          setError('Game not found');
          return;
        }
        setGame(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGame();
  }, [id]);
  
  const handleImportQuestions = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/games/${id}/import-questions`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import questions');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error importing questions:', error);
      throw new Error(error.message || 'Failed to import questions');
    }
  };
  
  const handleSaveCategories = async (categories: any[]) => {
    try {
      const response = await fetch(`/api/games/${id}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save categories');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error saving categories:', error);
      throw new Error(error.message || 'Failed to save categories');
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse">Loading game details...</div>
      </div>
    );
  }
  
  if (error || !game) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error || 'Failed to load game'}
        </div>
        <div className="mt-4">
          <Link 
            href="/admin/games" 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
          >
            Back to Games
          </Link>
        </div>
      </div>
    );
  }
  
  const gameAttributes = game.attributes;
  const gameType = gameAttributes?.type || 'linear';
  const categories = gameAttributes?.categories?.data || [];
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{gameAttributes?.name}</h1>
        
        <Link 
          href="/admin/games" 
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
        >
          Back to Games
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Game Details</h2>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Type:</span> {gameType === 'linear' ? 'Linear' : 'Nested'}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Status:</span> {gameAttributes?.status === 'premium' ? 'Premium' : 'Free'}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">Description:</span> {gameAttributes?.description || 'No description'}
            </p>
            
            <Link 
              href={`/admin/games/${id}/edit`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md inline-flex items-center"
            >
              Edit Game
            </Link>
          </div>
          
          {gameAttributes?.thumbnail?.data && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Thumbnail</h2>
              <div className="border border-gray-200 rounded-md p-2">
                <img 
                  src={gameAttributes.thumbnail.data.attributes.url} 
                  alt={gameAttributes.name} 
                  className="max-w-full h-auto max-h-48 object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {gameType === 'nested' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <CategoryManager 
            gameId={id} 
            initialCategories={categories.map((cat: any) => ({
              id: cat.id,
              name: cat.attributes.name,
              description: cat.attributes.description,
              gameId: id
            }))} 
            onChange={handleSaveCategories} 
          />
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <QuestionImporter 
          gameId={id} 
          gameType={gameType as 'linear' | 'nested'} 
          onImport={handleImportQuestions} 
        />
      </div>
    </div>
  );
} 