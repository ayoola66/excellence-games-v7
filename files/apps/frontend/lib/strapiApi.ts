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
    const token = localStorage.getItem('auth-token') || document.cookie
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
        localStorage.removeItem('auth-token')
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      }
    }
    return Promise.reject(error)
  }
)

export const strapiApi = {
  // ============= GAME OPERATIONS =============
  
  async getGames() {
    const response = await apiClient.get('/api/games?populate=thumbnail,categories.questions')
    return response.data
  },

  async getGame(id: string) {
    const response = await apiClient.get(`/api/games/${id}?populate=thumbnail,categories.questions`)
    return response.data
  },

  async createGame(gameData: {
    name: string
    description: string
    type: 'straight' | 'nested'
    status: 'free' | 'premium'
    thumbnail?: File
  }) {
    const formData = new FormData()
    
    // Add basic game data
    const data = {
      name: gameData.name,
      description: gameData.description,
      type: gameData.type,
      status: gameData.status,
      isActive: true,
      totalQuestions: 0,
      sortOrder: 0
    }
    
    formData.append('data', JSON.stringify(data))
    
    // Add thumbnail if provided
    if (gameData.thumbnail) {
      formData.append('files.thumbnail', gameData.thumbnail)
    }

    const response = await apiClient.post('/api/games', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // For nested games, create 5 default categories + 1 special card
    if (gameData.type === 'nested') {
      await this.createNestedGameCategories(response.data.data.id)
    }

    return response.data
  },

  async updateGame(id: string, gameData: any) {
    const response = await apiClient.put(`/api/games/${id}`, {
      data: gameData
    })
    return response.data
  },

  async deleteGame(id: string) {
    const response = await apiClient.delete(`/api/games/${id}`)
    return response.data
  },

  // ============= CATEGORY OPERATIONS =============

  async createNestedGameCategories(gameId: string) {
    const defaultCategories = [
      { name: 'Category 1', cardNumber: 1, description: 'First category for your nested game' },
      { name: 'Category 2', cardNumber: 2, description: 'Second category for your nested game' },
      { name: 'Category 3', cardNumber: 3, description: 'Third category for your nested game' },
      { name: 'Category 4', cardNumber: 4, description: 'Fourth category for your nested game' },
      { name: 'Category 5', cardNumber: 5, description: 'Fifth category for your nested game' },
      { name: 'Special Card', cardNumber: 6, description: 'Special card without questions', questionCount: 0 },
    ]

    const createdCategories = []
    for (let i = 0; i < defaultCategories.length; i++) {
      const categoryData = {
        ...defaultCategories[i],
        game: gameId,
        isActive: true,
        status: 'free',
        sortOrder: i + 1
      }

      const response = await apiClient.post('/api/categories', {
        data: categoryData
      })
      createdCategories.push(response.data.data)
    }

    return createdCategories
  },

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
    difficulty?: 'easy' | 'medium' | 'hard'
    category: string
    game: string
  }) {
    const response = await apiClient.post('/api/questions', {
      data: {
        ...questionData,
        isActive: true,
        timesAnswered: 0,
        timesCorrect: 0,
        sortOrder: 0
      }
    })
    
    // Update category question count
    await this.updateCategoryQuestionCount(questionData.category)
    
    return response.data
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
      localStorage.setItem('auth-token', response.data.jwt)
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
      localStorage.setItem('auth-token', response.data.jwt)
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
      localStorage.setItem('admin-token', response.data.data.token)
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
    const response = await apiClient.get('/api/background-musics?populate=*')
    return response.data
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

    const response = await apiClient.post('/api/background-musics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteMusicTrack(id: string) {
    const response = await apiClient.delete(`/api/background-musics/${id}`)
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
    const [games, users, music] = await Promise.all([
      this.getGames(),
      this.getUsers(),
      this.getMusicTracks()
    ])

    const gamesData = games.data || []
    const usersData = users || []
    const musicData = music.data || []

    return {
      games: {
        total: gamesData.length,
        free: gamesData.filter((g: any) => g.attributes.status === 'free').length,
        premium: gamesData.filter((g: any) => g.attributes.status === 'premium').length,
        totalQuestions: gamesData.reduce((total: number, game: any) => total + (game.attributes.totalQuestions || 0), 0)
      },
      users: {
        total: usersData.length,
        premium: usersData.filter((u: any) => u.subscriptionStatus === 'premium').length,
        free: usersData.filter((u: any) => u.subscriptionStatus === 'free').length
      },
      music: {
        total: musicData.length,
        backgroundTracks: musicData.filter((m: any) => m.attributes.type === 'background').length,
        userTracks: musicData.filter((m: any) => m.attributes.type === 'user').length,
        activeTracks: musicData.filter((m: any) => m.attributes.isActive).length
      }
    }
  }
}

export default strapiApi 