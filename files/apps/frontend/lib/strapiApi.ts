import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Get token from cookie only
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1]
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      }
    }
    return Promise.reject(error)
  }
)

export const strapiApi = {
  // ============= GAME OPERATIONS =============
  
  async getGames() {
    try {
      const response = await apiClient.get('/api/games?populate=thumbnail,categories')
      return response.data
    } catch (error: any) {
      console.error('Error fetching games:', error)
      // Return empty structure if games can't be fetched
      return { data: [] }
    }
  },

  async getGame(id: string) {
    const response = await apiClient.get(`/api/games/${id}?populate=thumbnail,categories.questions`)
    return response.data
  },

  async createGame(gameData: any) {
    try {
      let response
      
      // Check if gameData is FormData (contains thumbnail)
      if (gameData instanceof FormData) {
        response = await apiClient.post('/api/games', gameData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        // For nested games, use the specialized endpoint
        if (gameData.type === 'nested') {
          const nestedGameData = {
            name: gameData.name,
            description: gameData.description,
            status: gameData.status,
            categoryNames: gameData.categories || gameData.categoryNames
          }
          
          response = await apiClient.post('/api/games/create-nested', nestedGameData)
        } else {
          // Standard JSON request
          response = await apiClient.post('/api/games', {
            data: gameData
          })
        }
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error creating game:', error)
      throw error
    }
  },

  async updateGame(id: string, gameData: any) {
    // Check if gameData is FormData (contains thumbnail)
    if (gameData instanceof FormData) {
      const response = await apiClient.put(`/api/games/${id}`, gameData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } else {
      const response = await apiClient.put(`/api/games/${id}`, {
        data: gameData
      })
      return response.data
    }
  },

  async updateGameCategories(id: string, categoryNames: string[]) {
    const response = await apiClient.put(`/api/games/${id}/categories`, {
      categoryNames
    })
    return response.data
  },

  async deleteGame(id: string) {
    const response = await apiClient.delete(`/api/games/${id}`)
    return response.data
  },

  // ============= CATEGORY OPERATIONS =============

  async getCategories(gameId?: string) {
    const filters = gameId ? `?filters[game][id][$eq]=${gameId}&populate=questions` : '?populate=questions'
    const response = await apiClient.get(`/api/categories${filters}`)
    return response.data
  },

  async createCategory(categoryData: {
    name: string
    description?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    status?: 'free' | 'premium'
    game: string
    cardNumber?: number
  }) {
    const response = await apiClient.post('/api/categories', {
      data: {
        ...categoryData,
        isActive: true,
        questionCount: 0,
        sortOrder: 0
      }
    })
    return response.data
  },

  async updateCategory(id: string, categoryData: any) {
    const response = await apiClient.put(`/api/categories/${id}`, {
      data: categoryData
    })
    return response.data
  },

  async deleteCategory(id: string) {
    const response = await apiClient.delete(`/api/categories/${id}`)
    return response.data
  },

  // ============= QUESTION OPERATIONS =============

  async getCategoryQuestions(gameId: string, categoryId: string, excludeIds: string[] = []) {
    const excludeQuery = excludeIds.length > 0 ? `&excludeIds=${excludeIds.join(',')}` : ''
    const response = await apiClient.get(`/api/games/${gameId}/categories/${categoryId}/questions?${excludeQuery}`)
    return response.data
  },

  async createQuestion(questionData: {
    question: string
    option1: string
    option2: string
    option3: string
    option4: string
    correctAnswer: 'option1' | 'option2' | 'option3' | 'option4'
    explanation?: string
    category: string
    game: string
  }) {
    try {
      console.log('🔄 Creating question with data:', questionData)
      
      const response = await apiClient.post('/api/questions', {
        data: {
          question: questionData.question,
          option1: questionData.option1,
          option2: questionData.option2,
          option3: questionData.option3,
          option4: questionData.option4,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation || '',
          game: questionData.game,
          category: questionData.category || null,
          isActive: true,
          timesAnswered: 0,
          timesCorrect: 0,
          sortOrder: 0
        }
      })
      
      console.log('✅ Question created successfully:', response.data)
      
      // Update category question count only if category is provided
      if (questionData.category) {
        try {
          await this.updateCategoryQuestionCount(questionData.category)
        } catch (categoryError) {
          console.warn('Failed to update category count:', categoryError)
          // Don't fail the whole operation if category update fails
        }
      }
      
      return response.data
    } catch (error) {
      console.error('❌ Error creating question:', error)
      throw error
    }
  },

  async updateQuestion(id: string, questionData: any) {
    const response = await apiClient.put(`/api/questions/${id}`, {
      data: questionData
    })
    return response.data
  },

  async deleteQuestion(id: string) {
    // Get question to update category count
    const question = await apiClient.get(`/api/questions/${id}?populate=category`)
    const categoryId = question.data.data.attributes.category.data?.id
    
    const response = await apiClient.delete(`/api/questions/${id}`)
    
    // Update category question count
    if (categoryId) {
      await this.updateCategoryQuestionCount(categoryId)
    }
    
    return response.data
  },

  async updateCategoryQuestionCount(categoryId: string) {
    const questions = await apiClient.get(`/api/questions?filters[category][id][$eq]=${categoryId}&filters[isActive][$eq]=true`)
    const questionCount = questions.data.data.length
    
    await apiClient.put(`/api/categories/${categoryId}`, {
      data: { questionCount }
    })
  },

  async submitAnswer(questionId: string, selectedAnswer: string) {
    const response = await apiClient.post(`/api/games/submit-answer`, {
      questionId,
      selectedAnswer
    })
    return response.data
  },

  // ============= USER OPERATIONS =============

  async getUsers() {
    const response = await apiClient.get('/api/users?populate=*')
    return response.data
  },

  async createUser(userData: {
    username: string
    email: string
    fullName: string
    password: string
    phone?: string
    deliveryAddress?: string
  }) {
    const response = await apiClient.post('/api/auth/local/register', userData)
    return response.data
  },

  async updateUser(id: string, userData: any) {
    const response = await apiClient.put(`/api/users/${id}`, userData)
    return response.data
  },

  async deleteUser(id: string) {
    const response = await apiClient.delete(`/api/users/${id}`)
    return response.data
  },

  // ============= AUTHENTICATION =============

  async login(email: string, password: string) {
    const response = await apiClient.post('/api/auth/local', {
      identifier: email,
      password,
    })
    
    if (response.data.jwt) {
      document.cookie = `auth-token=${response.data.jwt}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
    }
    
    return response.data
  },

  async register(userData: {
    username: string
    email: string
    password: string
    fullName: string
    phone?: string
    deliveryAddress?: string
  }) {
    const response = await apiClient.post('/api/auth/local/register', userData)
    
    if (response.data.jwt) {
      document.cookie = `auth-token=${response.data.jwt}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
    }
    
    return response.data
  },

  async adminLogin(email: string, password: string) {
    const response = await apiClient.post('/api/admin-users/login', {
      email,
      password,
    })
    
    if (response.data.data.token) {
      document.cookie = `admin-token=${response.data.data.token}; path=/; max-age=${24 * 60 * 60}` // 1 day
    }
    
    return response.data
  },

  async verifyAdminSession(token: string) {
    const response = await apiClient.post('/api/admin-users/verify-session', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  // ============= MUSIC OPERATIONS =============

  async getMusicTracks() {
    try {
      const response = await apiClient.get('/api/background-music?populate=*')
      return response.data
    } catch (error: any) {
      // If endpoint doesn't exist, return empty data structure
      if (error.response?.status === 404) {
        return { data: [] }
      }
      throw error
    }
  },

  async uploadMusicTrack(trackData: {
    name: string
    type: 'background' | 'user'
    audioFile: File
  }) {
    const formData = new FormData()
    
    formData.append('data', JSON.stringify({
      name: trackData.name,
      type: trackData.type,
      isActive: true
    }))
    formData.append('files.audioFile', trackData.audioFile)

    const response = await apiClient.post('/api/background-music', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteMusicTrack(id: string) {
    const response = await apiClient.delete(`/api/background-music/${id}`)
    return response.data
  },

  // ============= BULK OPERATIONS =============

  async importQuestionsCSV(gameId: string, categoryId: string, csvFile: File) {
    const formData = new FormData()
    formData.append('gameId', gameId)
    formData.append('categoryId', categoryId)
    formData.append('csvFile', csvFile)

    const response = await apiClient.post('/api/questions/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    // Update category question count after import
    await this.updateCategoryQuestionCount(categoryId)
    
    return response.data
  },

  // ============= ANALYTICS =============

  async getDashboardStats() {
    try {
      const response = await apiClient.get('/api/admin-data')
      return response.data
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      // Return default stats if API fails
      return {
        totalGames: 0,
        totalQuestions: 0,
        totalUsers: 0,
        premiumUsers: 0,
        activeUsers: 0
      }
    }
  },

  // ============= USER PROFILE OPERATIONS =============

  async getUserProfile() {
    const response = await apiClient.get('/api/users/me?populate=userMusic')
    return response.data
  },

  async updateUserProfile(profileData: {
    fullName?: string
    phone?: string
    address?: string
  }) {
    const response = await apiClient.put('/api/users/me', profileData)
    return response.data
  },

  async uploadUserMusic(formData: FormData) {
    const response = await apiClient.post('/api/user-musics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteUserMusic(id: string) {
    const response = await apiClient.delete(`/api/user-musics/${id}`)
    return response.data
  },

  // ============= ENHANCED QUESTION OPERATIONS =============

  async getQuestions(filters?: {
    gameId?: string
    categoryId?: string
    search?: string
  }) {
    let url = '/api/questions?populate=category,game'
    
    if (filters) {
      const params = new URLSearchParams()
      
      if (filters.gameId) {
        params.append('filters[game][id][$eq]', filters.gameId)
      }
      
      if (filters.categoryId) {
        params.append('filters[category][id][$eq]', filters.categoryId)
      }
      
      if (filters.search) {
        params.append('filters[$or][0][question][$containsi]', filters.search)
        params.append('filters[$or][1][option1][$containsi]', filters.search)
        params.append('filters[$or][2][option2][$containsi]', filters.search)
        params.append('filters[$or][3][option3][$containsi]', filters.search)
        params.append('filters[$or][4][option4][$containsi]', filters.search)
      }
      
      if (params.toString()) {
        url += '&' + params.toString()
      }
    }
    
    try {
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching questions:', error)
      return { data: [] }
    }
  },

  async bulkImportQuestions(gameId: string, questionsData: any[]) {
    const response = await apiClient.post('/api/questions/bulk-import', {
      gameId,
      questions: questionsData
    })
    return response.data
  },

  // ============= MUSIC MANAGEMENT =============

  async getBackgroundMusic() {
    try {
      const response = await apiClient.get('/api/background-musics?populate=audioFile')
      return response.data
    } catch (error) {
      console.error('Error fetching background music:', error)
      return { data: [] }
    }
  },

  async uploadBackgroundMusic(formData: FormData) {
    const response = await apiClient.post('/api/background-musics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async toggleMusicActive(id: string, isActive: boolean) {
    const response = await apiClient.put(`/api/background-musics/${id}`, {
      data: { isActive }
    })
    return response.data
  },

  async deleteBackgroundMusic(id: string) {
    const response = await apiClient.delete(`/api/background-musics/${id}`)
    return response.data
  },

  // ============= USER MANAGEMENT (ADMIN) =============

  async getUsersList(filters?: {
    subscriptionStatus?: 'free' | 'premium'
    search?: string
  }) {
    let url = '/api/users?populate=userMusic'
    
    if (filters) {
      const params = new URLSearchParams()
      
      if (filters.subscriptionStatus) {
        params.append('filters[subscriptionStatus][$eq]', filters.subscriptionStatus)
      }
      
      if (filters.search) {
        params.append('filters[$or][0][email][$containsi]', filters.search)
        params.append('filters[$or][1][fullName][$containsi]', filters.search)
      }
      
      if (params.toString()) {
        url += '&' + params.toString()
      }
    }
    
    try {
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      return { data: [] }
    }
  },

  async updateUserSubscription(userId: string, subscriptionData: {
    subscriptionStatus: 'free' | 'premium'
    premiumExpiry?: string
  }) {
    const response = await apiClient.put(`/api/users/${userId}`, subscriptionData)
    return response.data
  },

  // ============= ANALYTICS =============

  async getGameAnalytics() {
    try {
      const response = await apiClient.get('/api/analytics/games')
      return response.data
    } catch (error) {
      console.error('Error fetching game analytics:', error)
      return { data: [] }
    }
  },

  async getUserAnalytics() {
    try {
      const response = await apiClient.get('/api/analytics/users')
      return response.data
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      return { data: [] }
    }
  },

  async getQuestionAnalytics() {
    try {
      const response = await apiClient.get('/api/analytics/questions')
      return response.data
    } catch (error) {
      console.error('Error fetching question analytics:', error)
      return { data: [] }
    }
  },

  // ============= SHOP OPERATIONS =============

  async getProducts(filters?: {
    type?: string
    category?: string
    featured?: boolean
    inStock?: boolean
    priceMin?: number
    priceMax?: number
    search?: string
    sort?: string
  }) {
    try {
      let url = '/api/products?populate=images'
      
      if (filters) {
        const params = new URLSearchParams()
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        
        if (params.toString()) {
          url += '&' + params.toString()
        }
      }
      
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      return { data: [] }
    }
  },

  async getProduct(id: string) {
    const response = await apiClient.get(`/api/products/${id}?populate=images`)
    return response.data
  },

  async getFeaturedProducts() {
    try {
      const response = await apiClient.get('/api/products/featured')
      return response.data
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return { data: [] }
    }
  },

  async getProductCategories() {
    try {
      const response = await apiClient.get('/api/products/categories')
      return response.data
    } catch (error) {
      console.error('Error fetching product categories:', error)
      return { data: [] }
    }
  },

  async createProduct(productData: any) {
    try {
      let response
      
      if (productData instanceof FormData) {
        response = await apiClient.post('/api/products', productData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        response = await apiClient.post('/api/products', {
          data: productData
        })
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  async updateProduct(id: string, productData: any) {
    try {
      let response
      
      if (productData instanceof FormData) {
        response = await apiClient.put(`/api/products/${id}`, productData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        response = await apiClient.put(`/api/products/${id}`, {
          data: productData
        })
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/api/products/${id}`)
    return response.data
  },

  async calculatePricing(items: Array<{ productId: string; quantity: number }>) {
    const response = await apiClient.post('/api/products/calculate-pricing', {
      items
    })
    return response.data
  },

  // ============= ORDER OPERATIONS =============

  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: any
    billingAddress: any
    paymentMethodId: string
  }) {
    const response = await apiClient.post('/api/orders', orderData)
    return response.data
  },

  async getOrders(filters?: {
    status?: string
    paymentStatus?: string
    search?: string
  }) {
    try {
      let url = '/api/orders?populate=user,products.images'
      
      if (filters) {
        const params = new URLSearchParams()
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        
        if (params.toString()) {
          url += '&' + params.toString()
        }
      }
      
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching orders:', error)
      return { data: [] }
    }
  },

  async getUserOrders() {
    try {
      const response = await apiClient.get('/api/orders/my-orders')
      return response.data
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return { data: [] }
    }
  },

  async updateOrderStatus(id: string, status: string, trackingNumber?: string) {
    const response = await apiClient.put(`/api/orders/${id}/status`, {
      status,
      trackingNumber
    })
    return response.data
  },

  // ============= SHOP SETTINGS =============

  async getShopSettings() {
    try {
      const response = await apiClient.get('/api/shop-setting')
      return response.data
    } catch (error) {
      console.error('Error fetching shop settings:', error)
      return { 
        data: {
          firstBoardGamePrice: 40.00,
          additionalBoardGamePrice: 25.00,
          currency: 'GBP',
          freeShippingThreshold: 50.00,
          standardShippingCost: 5.99,
          taxRate: 0.20
        } 
      }
    }
  },

  async updateShopSettings(settingsData: any) {
    const response = await apiClient.put('/api/shop-setting', {
      data: settingsData
    })
    return response.data
  }
}

export default strapiApi 