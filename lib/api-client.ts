import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const session = await getSession();
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(session?.jwt ? { Authorization: `Bearer ${session.jwt}` } : {}),
      ...options.headers,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const response = await fetch(`${API_URL}/api${endpoint}`, mergedOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error?.message || 'An error occurred'
    );
  }

  return data;
}

export const api = {
  // User Profile
  async getUserProfile() {
    return fetchAPI('/user-profile/me');
  },

  async updateUserProfile(data: any) {
    return fetchAPI('/user-profile/me', {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  },

  // Game Stats
  async getGameStats() {
    return fetchAPI('/game-stats');
  },

  async getRecentActivity() {
    return fetchAPI('/user-activity/recent');
  },

  // Premium Features
  async uploadMusic(formData: FormData) {
    return fetchAPI('/upload/music', {
      method: 'POST',
      headers: {},  // Let browser set correct content type with boundary
      body: formData,
    });
  },

  async getUserMusic() {
    return fetchAPI('/user-music');
  },

  // Games
  async getAvailableGames() {
    return fetchAPI('/games/available');
  },

  async startGame(gameId: string) {
    return fetchAPI(`/games/${gameId}/start`, { method: 'POST' });
  },

  async submitGameAnswer(gameId: string, answerId: string) {
    return fetchAPI(`/games/${gameId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answerId }),
    });
  },

  async getGameHistory(page = 1, limit = 10) {
    return fetchAPI(`/games/history?page=${page}&limit=${limit}`);
  },
};
