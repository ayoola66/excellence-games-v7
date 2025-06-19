import axios from 'axios';
import compatToast from '@/lib/notificationManager';

export interface Game {
  id: string;
  name: string;
  description?: string;
  status: 'free' | 'premium';
  type: 'straight' | 'nested';
  totalQuestions: number;
  thumbnail?: string;
  categories?: any[];
}

export const gamesApi = {
  async getGame(id: string): Promise<Game> {
    try {
      const response = await axios.get(`/api/games/${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      // Handle different response formats
      const gameData = response.data.data || response.data;
      return gameData.attributes || gameData;
    } catch (error: any) {
      console.error('Error fetching game:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        compatToast.error('You need a premium subscription to access this game');
      } else if (error.response?.status === 404) {
        compatToast.error('Game not found');
      } else {
        compatToast.error('Failed to fetch game details');
      }
      
      throw new Error('Failed to fetch game details');
    }
  },

  async listGames(): Promise<Game[]> {
    try {
      const response = await axios.get('/api/games');
      
      // Handle different response formats
      const gamesData = response.data.data || response.data;
      
      // Map to consistent format
      return Array.isArray(gamesData) 
        ? gamesData.map(game => game.attributes || game)
        : [];
    } catch (error) {
      console.error('Error fetching games:', error);
      compatToast.error('Failed to fetch games list');
      throw new Error('Failed to fetch games list');
    }
  },
  
  async getUserGames(): Promise<Game[]> {
    try {
      const response = await axios.get('/api/user/games');
      
      // Handle different response formats
      const gamesData = response.data.data || response.data;
      
      // Map to consistent format
      return Array.isArray(gamesData) 
        ? gamesData.map(game => game.attributes || game)
        : [];
    } catch (error) {
      console.error('Error fetching user games:', error);
      compatToast.error('Failed to fetch your games');
      throw new Error('Failed to fetch user games');
    }
  }
}; 