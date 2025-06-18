'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';
import GameCard from '@/components/admin/GameCard';
import GameEditDialog from '@/components/admin/GameEditDialog';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Game {
  id: string;
  name: string;
  description: string;
  type: 'straight' | 'nested';
  status: 'free' | 'premium';
  isActive: boolean;
  totalQuestions: number;
  thumbnail?: string | null;
  updatedAt: string;
  sortOrder?: number;
}

export default function AdminGamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      setFilteredGames(
        games.filter(
          game => 
            game.name.toLowerCase().includes(lowercaseSearch) || 
            game.description.toLowerCase().includes(lowercaseSearch)
        )
      );
    } else {
      setFilteredGames(games);
    }
  }, [searchTerm, games]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const response = await strapiApi.getAdminGames();
      
      // Map the games data to our interface structure
      const formattedGames: Game[] = response.data.map((game: any) => ({
        id: game.id,
        name: game.name,
        description: game.description,
        type: game.type || 'straight',
        status: game.status || 'free',
        isActive: game.isActive ?? true,
        totalQuestions: game.totalQuestions || 0,
        thumbnail: game.thumbnail?.data?.attributes?.url || null,
        updatedAt: game.updatedAt,
        sortOrder: game.sortOrder || 0
      }));
      
      // Sort games by sortOrder or updatedAt
      formattedGames.sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      
      setGames(formattedGames);
      setFilteredGames(formattedGames);
    } catch (err) {
      compatToast.error('Failed to fetch games.');
      console.error('Error fetching games:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGame = async (formData: FormData) => {
    try {
      console.log('handleSaveGame called with formData');
      let response;
      
      if (selectedGame) {
        // Update existing game
        console.log('Updating existing game with ID:', selectedGame.id);
        response = await strapiApi.updateGame(selectedGame.id, formData);
      } else {
        // Create new game
        console.log('Creating new game');
        response = await strapiApi.createGame(formData);
      }
      
      console.log('Game saved successfully, response:', response);
      
      // Force a refresh after a short delay to ensure the server has processed the image
      setTimeout(() => {
        console.log('Refreshing games list after save');
        fetchGames();
      }, 500);
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  };

  const handleDeleteGame = (game: Game) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Game',
      message: `Are you sure you want to delete "${game.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await strapiApi.deleteGame(game.id);
          setGames(games.filter(g => g.id !== game.id));
          compatToast.success('Game deleted successfully.');
        } catch (err) {
          compatToast.error('Failed to delete game.');
          console.error('Error deleting game:', err);
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setEditDialogOpen(true);
  };

  const handleManageQuestions = (gameId: string) => {
    router.push(`/admin/games/${gameId}/questions`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Games Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit and manage your games
          </p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => {
            setSelectedGame(null);
            setEditDialogOpen(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Game
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No games match your search.' : 'No games found. Create your first game!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={handleEditGame}
              onDelete={() => handleDeleteGame(game)}
              onManageQuestions={() => handleManageQuestions(game.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <GameEditDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        game={selectedGame}
        onSave={handleSaveGame}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type="danger"
      />
    </div>
  );
} 