export interface Role {
  id: number
  name: string
  description: string
  type: 'authenticated' | 'admin' | 'public'
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  username: string
  fullName?: string
  role?: Role
  subscriptionStatus?: string
  premiumExpiry?: string
  phone?: string
  address?: string
  favoriteGames?: string[]
  recentGames?: string[]
  gameProgress?: Record<string, any>
  customMusicTrack?: any
  preferences?: {
    musicEnabled: boolean
    musicVolume: number
  }
  billingInfo?: BillingInfo
}

export interface Admin {
  id: string
  email: string
  username: string
  role: string
}

export interface UserPreferences {
  soundEnabled: boolean
  musicEnabled: boolean
  musicVolume: number
  language: string
  theme?: 'light' | 'dark'
  notifications?: boolean
}

export interface BillingInfo {
  name?: string
  address?: string
  city?: string
  country?: string
  postcode?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  cardNumber?: number
  questionCount: number
  status: 'active' | 'inactive'
}

export interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  totalQuestions: number
  categories: Category[]
  isActive: boolean
}

export interface Question {
  id: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correctAnswer: string
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
  error?: {
    status: number
    name: string
    message: string
    details?: any
  }
}

export interface AuthResponse {
  jwt: string
  user: User
}

export interface AdminAuthResponse {
  jwt: string
  user: Admin
} 