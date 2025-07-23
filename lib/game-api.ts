import { api } from './api-client';
import { Game, Question } from '@/types/game';

interface GameResponse {
  data: Game[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface QuestionResponse {
  data: Question;
}

export const gameApi = {
  // Fetch available games for the current user
  async getAvailableGames(): Promise<GameResponse> {
    const response = await api.get('/games/available');
    return response.data;
  },

  // Start a new game session
  async startGame(gameId: number): Promise<{ sessionId: string }> {
    const response = await api.post(`/games/${gameId}/start`);
    return response.data;
  },

  // Get a random question for the current game
  async getRandomQuestion(
    gameId: number,
    cardNumber: number,
    category?: string
  ): Promise<QuestionResponse> {
    const params = new URLSearchParams({
      gameId: gameId.toString(),
      cardNumber: cardNumber.toString(),
    });
    if (category) {
      params.append('category', category);
    }
    const response = await api.get(`/questions/random?${params}`);
    return response.data;
  },

  // Submit an answer for the current question
  async submitAnswer(
    gameId: number,
    questionId: string,
    answer: number
  ): Promise<{ correct: boolean; points: number }> {
    const response = await api.post(`/games/${gameId}/answer`, {
      questionId,
      answer,
    });
    return response.data;
  },

  // End the current game session
  async endGame(gameId: number): Promise<{ finalScore: number }> {
    const response = await api.post(`/games/${gameId}/end`);
    return response.data;
  },
};
