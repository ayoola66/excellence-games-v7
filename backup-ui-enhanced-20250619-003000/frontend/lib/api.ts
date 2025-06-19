// Mock API service for demonstration
// In production, this would connect to the actual Strapi backend

import axios from 'axios';
import { mockUsers, mockAdmins } from './mock-credentials'

// Use the environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

// Create an axios instance with default config
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle auth token
api.interceptors.request.use((config) => {
  // Only try to get cookies in browser environment
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';')
    const adminToken = cookies.find(cookie => cookie.trim().startsWith('adminToken='))
    const userToken = cookies.find(cookie => cookie.trim().startsWith('clientUserToken='))

    if (adminToken) {
      const token = adminToken.split('=')[1]
      config.headers.Authorization = `Bearer ${token}`
    } else if (userToken) {
      const token = userToken.split('=')[1]
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    // Only try to handle cookies in browser environment
    if (typeof window !== 'undefined') {
      // Only clear tokens if the error is specifically about invalid/expired token
      if (error.response?.status === 401 && 
          (error.response?.data?.error === 'Invalid token' || 
           error.response?.data?.error === 'Token expired' ||
           error.response?.data?.error === 'Not authenticated')) {
        // Clear tokens on unauthorized
        document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'clientUserToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        
        // Redirect to login
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

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

// API client with typed methods
export const strapiApi = {
  // Auth endpoints
  async login(email: string, password: string) {
    const response = await api.post('/auth/local', {
      identifier: email,
      password,
    })
    return response.data
  },

  async register(email: string, password: string, username: string) {
    const response = await api.post('/auth/local/register', {
      email,
      password,
      username,
    })
    return response.data
  },

  // Admin endpoints
  async adminLogin(email: string, password: string) {
    const response = await api.post('/admin-user-profiles/login', {
      email,
      password,
    })
    return response.data
  },

  async verifyAdminSession(token: string) {
    const response = await api.post('/admin-user-profiles/verify-session', {
      token,
    })
    return response.data
  },

  // Game endpoints
  async getGames() {
    const response = await api.get('/games?populate=categories')
    return response.data
  },

  async getGame(id: string) {
    const response = await api.get(`/games/${id}?populate=*`)
    return response.data
  },

  async createGame(data: any) {
    const response = await api.post('/games', data)
    return response.data
  },

  async updateGame(id: string, data: any) {
    const response = await api.put(`/games/${id}`, data)
    return response.data
  },

  async deleteGame(id: string) {
    const response = await api.delete(`/games/${id}`)
    return response.data
  },

  // Question endpoints
  async getQuestions() {
    const response = await api.get('/questions?populate=*')
    return response.data
  },

  async getQuestion(id: string) {
    const response = await api.get(`/questions/${id}?populate=*`)
    return response.data
  },

  async createQuestion(data: any) {
    const response = await api.post('/questions', data)
    return response.data
  },

  async updateQuestion(id: string, data: any) {
    const response = await api.put(`/questions/${id}`, data)
    return response.data
  },

  async deleteQuestion(id: string) {
    const response = await api.delete(`/questions/${id}`)
    return response.data
  },

  // Admin endpoints
  async getAdminGames() {
    const response = await api.get('/games?populate=*')
    return response.data
  },

  async getAdminQuestions() {
    const response = await api.get('/questions?populate=*')
    return response.data
  },

  async getAdminStats() {
    const response = await api.get('/admin/stats')
    return response.data
  },

  // Helper methods
  get: (url: string, config?: any) => api.get(url, config),
  post: (url: string, data?: any, config?: any) => api.post(url, data, config),
  put: (url: string, data?: any, config?: any) => api.put(url, data, config),
  delete: (url: string, config?: any) => api.delete(url, config),
}

// User Management
export const getAdminUsers = () => api.get('/api/admin/users')
export const getAdminUser = (id: number) => api.get(`/api/admin/users/${id}`)
export const createAdminUser = (data: any) => api.post('/api/admin/users', data)
export const updateAdminUser = (id: number, data: any) => api.put(`/api/admin/users/${id}`, data)
export const deleteAdminUser = (id: number) => api.delete(`/api/admin/users/${id}`)

// User Management API endpoints
export const getUsers = async (page = 1, pageSize = 20) => {
  const response = await api.get(`/api/users?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`)
  
  if (!response.data) {
    throw new Error('No data received from API')
  }

  // Transform the data to match our frontend needs
  const users = Array.isArray(response.data) ? response.data : (response.data.data || [])
  const total = response.data.meta?.pagination?.total || users.length
  const pageCount = response.data.meta?.pagination?.pageCount || Math.ceil(total / pageSize)

  return {
    data: {
      data: users.map((user: any) => ({
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        fullName: user.profile?.fullName || user.username || '',
        subscriptionStatus: user.subscriptionType || 'free',
        blocked: !user.isActive,
        confirmed: true, // Assuming all users are confirmed
        createdAt: user.registrationDate || new Date().toISOString(),
        // Additional fields from the schema
        gameStats: user.gameStats || {},
        preferences: user.preferences || {},
        achievements: user.achievements || {},
        totalScore: user.totalScore || 0,
        gamesCompleted: user.gamesCompleted || 0,
        lastLogin: user.lastLogin,
        favoriteGames: user.favoriteGames?.map((game: any) => game.id) || [],
        recentGames: user.recentGames || []
      })),
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount,
          total
        }
      }
    }
  }
}

export const getUser = async (id: number) => {
  const response = await api.get(`/api/users/${id}?populate=*`)
  const userData = response.data.data || response.data
  return {
    data: {
      id: userData.id,
      attributes: {
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || userData.username || '',
        subscriptionStatus: userData.subscriptionStatus || 'free',
        blocked: userData.blocked || false,
        confirmed: userData.confirmed || false,
        createdAt: userData.createdAt || new Date().toISOString()
      }
    }
  }
}

export const createUser = (data: any) => 
  api.post(`/api/users`, { data })

export const updateUser = (id: number, data: any) => 
  api.put(`/api/users/${id}`, { data })

export const deleteUser = (id: number) => 
  api.delete(`/api/users/${id}`)

export default strapiApi 