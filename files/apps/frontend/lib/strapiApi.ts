import axios from 'axios'
import { User, UserPreferences, BillingInfo, AuthResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
})

// Function to get token from cookies
const getToken = () => {
  if (typeof document === 'undefined') return null;
  
  // Try to get either userToken or clientUserToken
  const userToken = document.cookie.split('userToken=')[1]?.split(';')[0];
  const clientUserToken = document.cookie.split('clientUserToken=')[1]?.split(';')[0];
  
  return userToken || clientUserToken;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Remove duplicate /api prefix if present
    if (config.url?.startsWith('/api/api/')) {
      config.url = config.url.replace('/api/api/', '/api/')
    }
    
    // Add token to request if available
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message, error.response?.status);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        console.warn('Session expired - redirecting to login');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error)
  }
)

export const strapiApi = {
  // User Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/api/auth/local', {
      identifier: email,
      password
    })
    return response.data
  },

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await api.post('/api/auth/local/register', {
      email,
      password,
      username
    })
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout')
  },

  async getMe(): Promise<User> {
    const response = await api.get('/api/users/me')
    return response.data
  },

  // Games
  async getGames() {
    try {
      // Add a debug log to check the token
      if (typeof window !== 'undefined') {
        const token = getToken();
        console.log('Using auth token:', token ? `${token.substring(0, 10)}...` : 'No token found');
      }
      
      const response = await api.get('/api/games?populate=*')
      console.log('Raw games response:', response.data)
      
      if (!response.data?.data) {
        console.warn('No games data in response')
        return { data: [] }
      }

      return {
        data: response.data.data.map((game: any) => ({
          id: game.id,
          attributes: {
            name: game.attributes?.name || '',
            description: game.attributes?.description || '',
            type: game.attributes?.type || 'straight',
            status: game.attributes?.status || 'free',
            totalQuestions: game.attributes?.totalQuestions || 0,
            isActive: game.attributes?.isActive ?? true,
            thumbnail: game.attributes?.thumbnail?.data ? {
              data: {
                attributes: {
                  url: game.attributes.thumbnail.data.attributes?.url || '',
                  name: game.attributes.thumbnail.data.attributes?.name || ''
                }
              }
            } : null,
            categories: game.attributes?.categories?.data?.map((cat: any) => ({
              id: cat.id,
              attributes: {
                name: cat.attributes?.name || '',
                description: cat.attributes?.description || '',
                questionCount: cat.attributes?.questionCount || 0,
                cardNumber: cat.attributes?.cardNumber,
                status: cat.attributes?.status || 'active'
              }
            })) || []
          }
        }))
      }
    } catch (error: any) {
      console.error('Error fetching games:', error)
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          console.warn('Authentication required - redirecting to login');
          window.location.href = '/login?from=/user/games';
          return { data: [], error: 'Authentication required' };
        }
      }
      
      return { data: [], error: error.message || 'Failed to fetch games' }
    }
  },

  async getGame(id: string) {
    const response = await api.get(`/api/games/${id}?populate=*`)
    return response.data
  },

  async toggleFavoriteGame(gameId: string) {
    try {
      const response = await api.post(`/api/users/me/favorites/${gameId}`)
      if (!response.data) {
        throw new Error('No response data')
      }
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error toggling favorite game:', error)
      return { success: false, error: 'Failed to update favorites' }
    }
  },

  // User Settings
  async updateSettings(preferences: UserPreferences): Promise<User> {
    const response = await api.put('/api/users/me/settings', preferences)
    return response.data
  },

  async updateBillingInfo(billingInfo: BillingInfo): Promise<User> {
    const response = await api.put('/api/users/me/billing', billingInfo)
    return response.data
  },

  // Music
  async uploadMusicTrack(data: { name: string; type: string; audioFile: File }): Promise<void> {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('type', data.type)
    formData.append('files', data.audioFile)
    await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Admin
  async getAdminStats() {
    try {
      // Get games count
      const gamesResponse = await api.get('/api/games')
      const games = gamesResponse.data.data || []

      // Get questions count
      const questionsResponse = await api.get('/api/questions')
      const questions = questionsResponse.data.data || []

      // Get users count
      const usersResponse = await api.get('/api/users')
      const users = usersResponse.data || []

      // Calculate premium users
      const premiumUsers = users.filter((user: any) => user.subscriptionStatus === 'premium')

      return {
        data: {
          totalGames: games.length,
          totalQuestions: questions.length,
          totalUsers: users.length,
          premiumUsers: premiumUsers.length
        }
      }
    } catch (error) {
      console.error('Error getting admin stats:', error)
      return {
        data: {
          totalGames: 0,
          totalQuestions: 0,
          totalUsers: 0,
          premiumUsers: 0
        }
      }
    }
  },

  // Admin Game Management
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
  },

  async getAdminGames() {
    try {
      const response = await api.get('/api/games?populate=*')
      return response.data
    } catch (error) {
      console.error('Error getting admin games:', error)
      throw error
    }
  },

  // Adding missing methods
  async getAdminQuestions() {
    try {
      const response = await api.get('/api/questions?populate=*')
      return {
        data: response.data.data.map((question: any) => ({
          id: question.id,
          attributes: {
            ...question.attributes,
            game: question.attributes.game,
          }
        }))
      }
    } catch (error) {
      console.error('Error getting admin questions:', error)
      throw error
    }
  },

  async getAdminUsers() {
    try {
      const response = await api.get('/api/admin-user-profiles?populate=*')
      return {
        data: response.data.data.map((user: any) => ({
          id: user.id,
          ...user.attributes,
          createdAt: user.attributes?.createdAt,
          updatedAt: user.attributes?.updatedAt
        }))
      }
    } catch (error) {
      console.error('Error fetching admin users:', error)
      return { data: [] }
    }
  },

  // Error Handler
  handleError(error: any): never {
    if (error.response) {
      throw new Error(error.response.data?.error?.message || 'An error occurred')
    }
    throw error
  },

  async getQuestionsForGame(gameId: string) {
    try {
      const response = await api.get(`/api/questions?filters[game][id][$eq]=${gameId}&populate=*`)
      return response.data.data.map((question: any) => ({
        id: question.id,
        ...question.attributes
      }))
    } catch (error) {
      console.error('Error fetching questions for game:', error)
      return []
    }
  },

  // Delete a question by ID
  async deleteQuestion(id: string) {
    try {
      const response = await api.delete(`/api/questions/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  },

  // Delete a product by ID
  async deleteProduct(id: string) {
    try {
      const response = await api.delete(`/api/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  // Get all products
  async getProducts() {
    try {
      const response = await api.get('/api/products?populate=*')
      return { data: response.data.data }
    } catch (error) {
      console.error('Error fetching products:', error)
      return { data: [] }
    }
  },

  // Get all orders
  async getOrders() {
    try {
      const response = await api.get('/api/orders?populate=*')
      return { data: response.data.data }
    } catch (error) {
      console.error('Error fetching orders:', error)
      return { data: [] }
    }
  },

  // Update an order's status and tracking number
  async updateOrder(orderId: string, status: string, trackingNumber?: string) {
    try {
      const response = await api.put(`/api/orders/${orderId}`, {
        data: { status, trackingNumber }
      })
      return response.data
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  },

  // Update a user's subscription status
  async updateUserSubscription(userId: string, subscriptionStatus: 'free' | 'premium') {
    try {
      const response = await api.put(`/api/users/${userId}`, {
        data: { subscriptionStatus }
      })
      return response.data
    } catch (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }
  },

  // Get analytics data
  async getAnalytics() {
    try {
      const response = await api.get('/api/admin/analytics')
      return response
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  },

  // Get shop settings
  async getShopSettings() {
    try {
      const response = await api.get('/api/shop-settings')
      return response
    } catch (error) {
      console.error('Error fetching shop settings:', error)
      throw error
    }
  },

  // Update shop settings
  async updateShopSettings(data: any) {
    try {
      const response = await api.put('/api/shop-settings', { data })
      return response.data
    } catch (error) {
      console.error('Error updating shop settings:', error)
      throw error
    }
  },

  // Delete a category by ID
  async deleteCategory(id: string) {
    try {
      const response = await api.delete(`/api/categories/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  },

  // Create a new category
  async createCategory(data: any) {
    try {
      const response = await api.post('/api/categories', { data })
      return response.data
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  },

  // Get a category by ID
  async getCategory(id: string) {
    try {
      const response = await api.get(`/api/categories/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  },

  // Update a category by ID
  async updateCategory(id: string, data: any) {
    try {
      const response = await api.put(`/api/categories/${id}`, { data })
      return response.data
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  // Get all questions for a category
  async getQuestionsForCategory(categoryId: string) {
    try {
      const response = await api.get(`/api/questions?filters[category][id][$eq]=${categoryId}&populate=*`)
      return response.data.data.map((question: any) => ({
        id: question.id,
        ...question.attributes
      }))
    } catch (error) {
      console.error('Error fetching questions for category:', error)
      return []
    }
  },

  // Create a new question
  async createQuestion(data: any) {
    try {
      const response = await api.post('/api/questions', { data })
      return response.data
    } catch (error) {
      console.error('Error creating question:', error)
      throw error
    }
  },

  // Get a question by ID
  async getQuestion(id: string) {
    try {
      const response = await api.get(`/api/questions/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching question:', error)
      throw error
    }
  },

  // Update a question by ID
  async updateQuestion(id: string, data: any) {
    try {
      const response = await api.put(`/api/questions/${id}`, { data })
      return response.data
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  },

  async updateUser(id: number, userData: {
    username?: string;
    email?: string;
    profile?: {
      fullName?: string;
    };
    subscriptionType?: 'free' | 'premium';
    subscriptionStatus?: 'free' | 'premium';
    isActive?: boolean;
    premiumExpiry?: string | null;
    phone?: string;
    address?: string;
    blocked?: boolean;
  }): Promise<User> {
    const response = await api.put(`/api/users/${id}`, {
      username: userData.username,
      email: userData.email,
      profile: userData.profile,
      subscriptionType: userData.subscriptionType,
      subscriptionStatus: userData.subscriptionStatus,
      isActive: userData.isActive,
      premiumExpiry: userData.premiumExpiry,
      phone: userData.phone,
      address: userData.address,
      blocked: userData.blocked
    })
    return response.data
  },

  // Generic API methods
  async get(endpoint: string) {
    try {
      const response = await api.get(endpoint)
      return response
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error)
      throw error
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await api.delete(endpoint)
      return response
    } catch (error) {
      console.error(`Error deleting from ${endpoint}:`, error)
      throw error
    }
  },

  async post(endpoint: string, data?: any) {
    try {
      const response = await api.post(endpoint, data)
      return response.data
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error)
      throw error
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/users/me?populate=role')
      return response.data
    } catch (error) {
      console.error('Error fetching current user:', error)
      throw error
    }
  },

  async getUserData() {
    try {
      const response = await api.get('/api/admin/user-data')
      return response.data
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw error
    }
  },

  // Add the missing methods for game questions and file uploads
  async getAdminGame(id: string) {
    try {
      const response = await api.get(`/api/games/${id}?populate=*`)
      return response.data
    } catch (error) {
      console.error(`Error getting admin game ${id}:`, error)
      throw error
    }
  },

  async getGameQuestions(gameId: string) {
    try {
      const response = await api.get(`/api/games/${gameId}/questions?populate=*`)
      return {
        data: response.data.data || []
      }
    } catch (error) {
      console.error(`Error getting questions for game ${gameId}:`, error)
      return { data: [] }
    }
  },

  async uploadFile(formData: FormData) {
    try {
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  // Import questions for a game
  async importQuestions(gameId: string, questions: any[]) {
    try {
      const response = await api.post('/api/questions/import', {
        gameId,
        questions
      })
      return response.data
    } catch (error) {
      console.error('Error importing questions:', error)
      throw error
    }
  },
  
  // Import questions from XLSX file for nested games
  async importQuestionsXLSX(gameId: string, xlsxFile: File) {
    const formData = new FormData()
    formData.append('gameId', gameId)
    formData.append('xlsxFile', xlsxFile, xlsxFile.name)
    
    try {
      const response = await api.post('/api/questions/import-xlsx', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error importing XLSX questions:', error)
      throw error
    }
  }
}