// Mock API service for demonstration
// In production, this would connect to the actual Strapi backend

import axios from 'axios';
import { mockUsers, mockAdmins } from './mock-credentials'

// Always use the local Strapi server in development
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

// Create axios instance with base URL and default headers
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookies instead of localStorage
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';')
      const userToken = cookies.find(cookie => cookie.trim().startsWith('userToken='))
      const adminToken = cookies.find(cookie => cookie.trim().startsWith('adminToken='))
      
      if (config.url?.includes('/admin-user-profiles') && adminToken) {
        config.headers.Authorization = `Bearer ${adminToken.split('=')[1]}`
      } else if (userToken) {
        config.headers.Authorization = `Bearer ${userToken.split('=')[1]}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response for debugging
    console.log('API Response:', response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      // Handle unauthorized error
      console.error('Unauthorized access')
    }
    return Promise.reject(error)
  }
)

// Export the axios instance for direct use
export const api = axiosInstance

// Mock data for demonstration
const mockGames = [
  {
    id: '1',
    name: 'General Knowledge Challenge',
    description: 'Test your knowledge across various topics with this comprehensive trivia game.',
    type: 'straight',
    status: 'free',
    thumbnail: null,
    totalQuestions: 50,
    isActive: true,
    categories: [
      { 
        id: '1',
        attributes: {
          name: 'History',
          description: 'Test your knowledge of historical events and figures',
          questionCount: 15,
          status: 'active'
        }
      },
      { 
        id: '2',
        attributes: {
          name: 'Science',
          description: 'Explore the world of scientific discoveries',
          questionCount: 20,
          status: 'active'
        }
      },
      { 
        id: '3',
        attributes: {
          name: 'Geography',
          description: 'Learn about countries, capitals, and landmarks',
          questionCount: 15,
          status: 'active'
        }
      }
    ]
  },
  {
    id: '2',
    name: 'Sports Spectacular',
    description: 'Challenge yourself with questions about various sports and athletic achievements.',
    type: 'nested',
    status: 'premium',
    thumbnail: null,
    totalQuestions: 75,
    isActive: true,
    categories: [
      { 
        id: '4',
        attributes: {
          name: 'Football',
          description: 'Test your football knowledge',
          questionCount: 15,
          cardNumber: 1,
          status: 'active'
        }
      },
      { 
        id: '5',
        attributes: {
          name: 'Basketball',
          description: 'Basketball trivia and history',
          questionCount: 15,
          cardNumber: 2,
          status: 'active'
        }
      },
      { 
        id: '6',
        attributes: {
          name: 'Tennis',
          description: 'Tennis champions and grand slams',
          questionCount: 15,
          cardNumber: 3,
          status: 'active'
        }
      },
      { 
        id: '7',
        attributes: {
          name: 'Cricket',
          description: 'Cricket rules and famous matches',
          questionCount: 15,
          cardNumber: 4,
          status: 'active'
        }
      },
      { 
        id: '8',
        attributes: {
          name: 'Golf',
          description: 'Golf tournaments and legends',
          questionCount: 15,
          cardNumber: 5,
          status: 'active'
        }
      },
      { 
        id: '9',
        attributes: {
          name: 'Special Card',
          description: 'Choose any category to answer from',
          questionCount: 0,
          cardNumber: 6,
          status: 'active'
        }
      }
    ]
  },
  {
    id: '3',
    name: 'Science & Technology',
    description: 'Explore the fascinating world of science and modern technology.',
    type: 'straight',
    status: 'free',
    thumbnail: null,
    totalQuestions: 40,
    isActive: true,
    categories: [
      { 
        id: '10',
        attributes: {
          name: 'Physics',
          description: 'Laws of physics and famous physicists',
          questionCount: 15,
          status: 'active'
        }
      },
      { 
        id: '11',
        attributes: {
          name: 'Chemistry',
          description: 'Chemical reactions and elements',
          questionCount: 15,
          status: 'active'
        }
      },
      { 
        id: '12',
        attributes: {
          name: 'Technology',
          description: 'Modern tech and innovations',
          questionCount: 10,
          status: 'active'
        }
      }
    ]
  },
  {
    id: '4',
    name: 'Entertainment Extravaganza',
    description: 'Movies, music, TV shows, and celebrity trivia all in one exciting game.',
    type: 'nested',
    status: 'premium',
    thumbnail: null,
    totalQuestions: 90,
    isActive: true,
    categories: [
      { 
        id: '13',
        attributes: {
          name: 'Movies',
          description: 'Film history and trivia',
          questionCount: 18,
          cardNumber: 1,
          status: 'active'
        }
      },
      { 
        id: '14',
        attributes: {
          name: 'Music',
          description: 'Musical genres and artists',
          questionCount: 18,
          cardNumber: 2,
          status: 'active'
        }
      },
      { 
        id: '15',
        attributes: {
          name: 'TV Shows',
          description: 'Television series and characters',
          questionCount: 18,
          cardNumber: 3,
          status: 'active'
        }
      },
      { 
        id: '16',
        attributes: {
          name: 'Celebrities',
          description: 'Famous personalities and their lives',
          questionCount: 18,
          cardNumber: 4,
          status: 'active'
        }
      },
      { 
        id: '17',
        attributes: {
          name: 'Awards',
          description: 'Entertainment awards and ceremonies',
          questionCount: 18,
          cardNumber: 5,
          status: 'active'
        }
      },
      { 
        id: '18',
        attributes: {
          name: 'Bonus Round',
          description: 'Special bonus questions from any category',
          questionCount: 0,
          cardNumber: 6,
          status: 'active'
        }
      }
    ]
  }
]

const mockQuestions = [
  // History Questions (Category 1)
  {
    id: '1',
    question: 'What is the capital of France?',
    option1: 'London',
    option2: 'Berlin',
    option3: 'Paris',
    option4: 'Madrid',
    correctAnswer: 'option3',
    explanation: 'Paris has been the capital of France since the 12th century.',
    difficulty: 'easy',
    categoryId: '1',
    gameId: '1'
  },
  {
    id: '2',
    question: 'In which year did World War II end?',
    option1: '1944',
    option2: '1945',
    option3: '1946',
    option4: '1947',
    correctAnswer: 'option2',
    explanation: 'World War II ended in 1945 with the surrender of Japan.',
    difficulty: 'medium',
    categoryId: '1',
    gameId: '1'
  },
  {
    id: '3',
    question: 'Who was the first monarch of England?',
    option1: 'Alfred the Great',
    option2: 'William the Conqueror',
    option3: 'Henry VIII',
    option4: 'Æthelstan',
    correctAnswer: 'option4',
    explanation: 'Æthelstan was the first King of England, ruling from 924 to 939.',
    difficulty: 'hard',
    categoryId: '1',
    gameId: '1'
  },
  // Science Questions (Category 2)
  {
    id: '4',
    question: 'Which planet is known as the Red Planet?',
    option1: 'Venus',
    option2: 'Mars',
    option3: 'Jupiter',
    option4: 'Saturn',
    correctAnswer: 'option2',
    explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
    difficulty: 'easy',
    categoryId: '2',
    gameId: '1'
  },
  {
    id: '5',
    question: 'What is the chemical symbol for gold?',
    option1: 'Go',
    option2: 'Gd',
    option3: 'Au',
    option4: 'Ag',
    correctAnswer: 'option3',
    explanation: 'Au comes from the Latin word "aurum" meaning gold.',
    difficulty: 'medium',
    categoryId: '2',
    gameId: '1'
  },
  {
    id: '6',
    question: 'How many chambers does a human heart have?',
    option1: 'Two',
    option2: 'Three',
    option3: 'Four',
    option4: 'Five',
    correctAnswer: 'option3',
    explanation: 'The human heart has four chambers: two atria and two ventricles.',
    difficulty: 'easy',
    categoryId: '2',
    gameId: '1'
  },
  // Geography Questions (Category 3)
  {
    id: '7',
    question: 'Which is the longest river in the world?',
    option1: 'Amazon',
    option2: 'Nile',
    option3: 'Mississippi',
    option4: 'Yangtze',
    correctAnswer: 'option2',
    explanation: 'The Nile River in Africa is approximately 6,650 kilometres long.',
    difficulty: 'medium',
    categoryId: '3',
    gameId: '1'
  },
  {
    id: '8',
    question: 'What is the smallest country in the world?',
    option1: 'Monaco',
    option2: 'Nauru',
    option3: 'Vatican City',
    option4: 'San Marino',
    correctAnswer: 'option3',
    explanation: 'Vatican City is only 0.17 square miles (0.44 square kilometres).',
    difficulty: 'easy',
    categoryId: '3',
    gameId: '1'
  },
  // Football Questions for Premium Game (Category 4)
  {
    id: '9',
    question: 'Which country won the FIFA World Cup in 2018?',
    option1: 'Brazil',
    option2: 'Germany',
    option3: 'France',
    option4: 'Argentina',
    correctAnswer: 'option3',
    explanation: 'France won the 2018 FIFA World Cup held in Russia.',
    difficulty: 'easy',
    categoryId: '4',
    gameId: '2'
  },
  {
    id: '10',
    question: 'Who is known as "The Special One" in football?',
    option1: 'Pep Guardiola',
    option2: 'José Mourinho',
    option3: 'Sir Alex Ferguson',
    option4: 'Arsène Wenger',
    correctAnswer: 'option2',
    explanation: 'José Mourinho famously called himself "The Special One".',
    difficulty: 'medium',
    categoryId: '4',
    gameId: '2'
  }
]

// Export API functions
export const strapiApi = {
  // Auth endpoints
  async login(email: string, password: string) {
    try {
      const response = await api.post('/api/auth/local', {
        identifier: email,
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  },

  async register(email: string, password: string, fullName: string) {
    try {
      const response = await api.post('/api/auth/local/register', {
        username: email.split('@')[0],
        email,
        password,
        fullName,
      });
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      throw error;
    }
  },

  async adminLogin(email: string, password: string) {
    try {
      const response = await api.post('/admin-user-profiles/login', {
        email,
        password,
      });

      if (response.data?.data?.token) {
        localStorage.setItem('adminToken', response.data.data.token);
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Admin login error:', error.response?.data || error);
      throw error;
    }
  },

  async verifyAdminSession() {
    try {
      const response = await api.post('/admin-user-profiles/verify-session');
      return response.data?.data;
    } catch (error: any) {
      console.error('Session verification error:', error.response?.data || error);
      throw error;
    }
  },

  // Game endpoints
  async getGames() {
    try {
      const response = await api.get('/api/games?populate=categories')
      return response.data
    } catch (error) {
      console.error('Error fetching games:', error)
      throw error
    }
  },

  async getGameStats() {
    try {
      const [gamesCount, questionsCount, usersCount, premiumUsersCount] = await Promise.all([
        api.get('/api/games/count'),
        api.get('/api/questions/count'),
        api.get('/api/users/count'),
        api.get('/api/users/count?subscriptionStatus=premium')
      ])

      return {
        totalGames: gamesCount.data,
        totalQuestions: questionsCount.data,
        totalUsers: usersCount.data,
        premiumUsers: premiumUsersCount.data
      }
    } catch (error) {
      console.error('Error fetching game stats:', error)
      throw error
    }
  },

  async getGame(id: string) {
    try {
      const response = await api.get(`/api/games/${id}?populate=*`)
      return response.data
    } catch (error) {
      console.error('Error fetching game:', error)
      throw error
    }
  },

  async getGameCategories(gameId: string) {
    const response = await api.get(`/api/games/${gameId}/categories?populate=*`)
    return response.data
  },

  async getGameQuestions(gameId: string, categoryId: string) {
    const response = await api.get(`/api/games/${gameId}/categories/${categoryId}/questions?populate=*`)
    return response.data
  },

  async submitAnswer(gameId: string, questionId: string, answer: string) {
    const response = await api.post(`/api/games/${gameId}/submit-answer`, {
      questionId,
      answer,
    });
    return response.data;
  },

  // User endpoints
  async toggleFavoriteGame(gameId: string) {
    const response = await fetch(`${API_URL}/api/users/me/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }

    return response.json();
  },

  async updateUserPreferences(preferences: any) {
    const response = await fetch(`${API_URL}/api/users/me/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }

    return response.json();
  },

  async uploadMusicTrack(file: File) {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload music track');
    }

    return response.json();
  },

  // Admin endpoints
  async createGame(data: any) {
    try {
      const response = await api.post('/api/games', data)
      return response.data
    } catch (error) {
      console.error('Error creating game:', error)
      throw error
    }
  },

  async updateGame(id: string, data: any) {
    try {
      const response = await api.put(`/api/games/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating game:', error)
      throw error
    }
  },

  async updateGameCategories(id: string, categories: any[]) {
    try {
      const response = await api.put(`/api/games/${id}/categories`, { categories })
      return response.data
    } catch (error) {
      console.error('Error updating game categories:', error)
      throw error
    }
  },

  async deleteGame(id: string) {
    try {
      const response = await api.delete(`/api/games/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting game:', error)
      throw error
    }
  }
}

export default strapiApi 