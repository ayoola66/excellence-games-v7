import axios from 'axios'
import { User, UserPreferences, BillingInfo, AuthResponse } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Remove duplicate /api prefix if present
    if (config.url?.startsWith('/api/api/')) {
      config.url = config.url.replace('/api/api/', '/api/')
    }

    // Add JWT token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
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
    if (response.data.jwt) {
      localStorage.setItem('token', response.data.jwt)
    }
    return response.data
  },

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await api.post('/api/auth/local/register', {
      email,
      password,
      username
    })
    if (response.data.jwt) {
      localStorage.setItem('token', response.data.jwt)
    }
    return response.data
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token')
    await api.post('/api/auth/logout')
  },

  async getMe(): Promise<User> {
    const response = await api.get('/api/users/me')
    return response.data
  },

  // Games
  async getGames() {
    try {
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
    } catch (error) {
      console.error('Error fetching games:', error)
      return { data: [] }
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

      if (!response.data?.data) {
        console.warn('No games data in response')
        return { data: [] }
      }

      // Map the response data to a flat structure
      const mappedGames = response.data.data.map((game: any) => ({
        id: game.id,
        name: game.name,
        description: game.description,
        type: game.type || 'straight',
        status: game.status || 'free',
        isActive: game.isActive ?? true,
        totalQuestions: game.totalQuestions || 0,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        sortOrder: game.sortOrder || 0,
        thumbnail: game.thumbnail?.data ? {
          data: {
            attributes: {
              url: game.thumbnail.data.attributes?.url || '',
              name: game.thumbnail.data.attributes?.name || ''
            }
          }
        } : null
      }))

      return { data: mappedGames }
    } catch (error) {
      console.error('Error fetching admin games:', error)
      return { data: [] }
    }
  },

  async getAdminQuestions() {
    const response = await api.get('/api/questions?populate=*')
    return {
      data: response.data.data.map((question: any) => ({
        id: question.id,
        attributes: {
          ...question.attributes,
          game: question.attributes.game,
          category: question.attributes.category
        }
      }))
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
    const response = await api.get(`/api/questions?filters[game][id][$eq]=${gameId}&populate=*`)
    return response.data.data.map((question: any) => ({
      id: question.id,
      ...question.attributes
    }))
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
  }
}