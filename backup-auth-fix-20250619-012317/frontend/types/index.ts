/**
 * Type exports
 */

export * from './game';

export interface Role {
  id: number
  name: string
  description: string
  type: 'authenticated' | 'admin' | 'public'
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  username: string
  email: string
  fullName?: string
  subscriptionStatus: 'free' | 'premium'
  blocked?: boolean
  confirmed?: boolean
  createdAt?: string
  gameStats?: Record<string, any>
  preferences?: Record<string, any>
  achievements?: Record<string, any>
  totalScore?: number
  gamesCompleted?: number
  lastLogin?: string
  favoriteGames?: string[]
  recentGames?: any[]
  role?: 'user' | 'admin'
  profile?: {
    fullName?: string
  }
  isActive?: boolean
  premiumExpiry?: string | null
  phone?: string
  address?: string
  gameProgress?: Record<string, any>
  customMusicTrack?: any
  billingInfo?: BillingInfo
  token?: string
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
  attributes: {
    name: string
    description: string
    questionCount: number
    cardNumber?: number
    status: string
  }
}

export interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  totalQuestions: number
  categories?: Category[]
  createdAt: string
  updatedAt: string
  thumbnail?: {
    url: string
    name: string
  } | string | null
  isActive: boolean
  sortOrder?: number
}

export interface Question {
  id: string
  attributes: {
    question: string
    option1: string
    option2: string
    option3: string
    option4: string
    correctAnswer: 'option1' | 'option2' | 'option3' | 'option4'
    explanation?: string
    category?: {
      data: {
        id: string
        attributes: {
          name: string
        }
      }
    }
    game?: {
      data: {
        id: string
        attributes: {
          name: string
        }
      }
    }
    isActive?: boolean
    timesAnswered?: number
    timesCorrect?: number
    sortOrder?: number
  }
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

export interface AdminStats {
  totalGames: number
  totalQuestions: number
  totalUsers: number
  premiumUsers: number
} 