// Mock API service for demonstration
// In production, this would connect to the actual Strapi backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'

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
    accessType: 'free',
    categories: [
      { id: '1', name: 'History', questionCount: 15 },
      { id: '2', name: 'Science', questionCount: 20 },
      { id: '3', name: 'Geography', questionCount: 15 }
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
    accessType: 'locked',
    categories: [
      { id: '4', name: 'Football', questionCount: 15, cardNumber: 1 },
      { id: '5', name: 'Basketball', questionCount: 15, cardNumber: 2 },
      { id: '6', name: 'Tennis', questionCount: 15, cardNumber: 3 },
      { id: '7', name: 'Cricket', questionCount: 15, cardNumber: 4 },
      { id: '8', name: 'Golf', questionCount: 15, cardNumber: 5 },
      { id: '9', name: 'Special Card', questionCount: 0, cardNumber: 6 }
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
    accessType: 'free',
    categories: [
      { id: '10', name: 'Physics', questionCount: 15 },
      { id: '11', name: 'Chemistry', questionCount: 15 },
      { id: '12', name: 'Technology', questionCount: 10 }
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
    accessType: 'locked',
    categories: [
      { id: '13', name: 'Movies', questionCount: 18, cardNumber: 1 },
      { id: '14', name: 'Music', questionCount: 18, cardNumber: 2 },
      { id: '15', name: 'TV Shows', questionCount: 18, cardNumber: 3 },
      { id: '16', name: 'Celebrities', questionCount: 18, cardNumber: 4 },
      { id: '17', name: 'Awards', questionCount: 18, cardNumber: 5 },
      { id: '18', name: 'Bonus Round', questionCount: 0, cardNumber: 6 }
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

// Mock API functions
export const api = {
  // Game endpoints
  async getGames() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      data: mockGames,
      meta: { total: mockGames.length }
    }
  },

  async getGame(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const game = mockGames.find(g => g.id === id)
    if (!game) throw new Error('Game not found')
    return { data: game }
  },

  async getCategoryQuestions(gameId: string, categoryId: string, excludeIds: string[] = []) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const availableQuestions = mockQuestions.filter(q => 
      q.gameId === gameId && 
      q.categoryId === categoryId && 
      !excludeIds.includes(q.id)
    )
    
    if (availableQuestions.length === 0) {
      throw new Error('No more questions available')
    }
    
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    return { data: randomQuestion }
  },

  async submitAnswer(questionId: string, selectedAnswer: string) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const question = mockQuestions.find(q => q.id === questionId)
    if (!question) throw new Error('Question not found')
    
    const isCorrect = question.correctAnswer === selectedAnswer
    return {
      data: {
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        selectedAnswer
      }
    }
  },

  // Auth endpoints
  async login(email: string, password: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock user authentication
    if (email === 'user@example.com' && password === 'password') {
      return {
        jwt: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'user@example.com',
          fullName: 'Demo User',
          subscriptionStatus: 'free',
          gameProgress: {},
          musicPreferences: {}
        }
      }
    }
    
    if (email === 'premium@example.com' && password === 'password') {
      return {
        jwt: 'mock-jwt-token-premium',
        user: {
          id: '2',
          email: 'premium@example.com',
          fullName: 'Premium User',
          subscriptionStatus: 'premium',
          premiumExpiry: '2025-12-31T23:59:59.000Z',
          gameProgress: {},
          musicPreferences: {}
        }
      }
    }
    
    throw new Error('Invalid credentials')
  },

  async register(userData: any) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock registration
    return {
      jwt: 'mock-jwt-token-new',
      user: {
        id: '3',
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        deliveryAddress: userData.deliveryAddress,
        subscriptionStatus: 'free',
        gameProgress: {},
        musicPreferences: {}
      }
    }
  },

  // Admin endpoints
  async adminLogin(email: string, password: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const adminCredentials = [
      {
        email: 'superadmin@targetedgames.com',
        password: 'SuperAdmin2024!',
        admin: {
          id: '1',
          email: 'superadmin@targetedgames.com',
          fullName: 'Super Administrator',
          adminType: 'SA',
          badge: 'SA',
          permissions: [
            'manage_trivia', 'manage_users', 'manage_admins', 'manage_music',
            'manage_shop', 'view_orders', 'view_subscriptions', 'view_analytics',
            'system_settings', 'financial_data'
          ]
        }
      },
      {
        email: 'devadmin@targetedgames.com',
        password: 'DevAdmin2024!',
        admin: {
          id: '2',
          email: 'devadmin@targetedgames.com',
          fullName: 'Development Administrator',
          adminType: 'DEV',
          badge: 'DEV',
          permissions: [
            'manage_trivia', 'manage_users', 'manage_limited_admins', 'manage_music',
            'manage_shop', 'view_analytics', 'system_settings'
          ]
        }
      },
      {
        email: 'contentadmin@targetedgames.com',
        password: 'ContentAdmin2024!',
        admin: {
          id: '3',
          email: 'contentadmin@targetedgames.com',
          fullName: 'Content Administrator',
          adminType: 'CT',
          badge: 'CT',
          permissions: [
            'manage_trivia', 'manage_content', 'manage_questions', 'view_analytics'
          ]
        }
      }
    ]
    
    const credential = adminCredentials.find(c => c.email === email && c.password === password)
    if (!credential) {
      throw new Error('Invalid admin credentials')
    }
    
    return {
      data: {
        token: 'mock-admin-jwt-token',
        admin: credential.admin
      }
    }
  },

  async verifyAdminSession(token: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock session verification
    if (token === 'mock-admin-jwt-token') {
      return {
        data: {
          admin: {
            id: '1',
            email: 'superadmin@targetedgames.com',
            fullName: 'Super Administrator',
            adminType: 'SA',
            badge: 'SA',
            permissions: [
              'manage_trivia', 'manage_users', 'manage_admins', 'manage_music',
              'manage_shop', 'view_orders', 'view_subscriptions', 'view_analytics',
              'system_settings', 'financial_data'
            ]
          },
          valid: true
        }
      }
    }
    
    throw new Error('Invalid session')
  }
}

export default api 