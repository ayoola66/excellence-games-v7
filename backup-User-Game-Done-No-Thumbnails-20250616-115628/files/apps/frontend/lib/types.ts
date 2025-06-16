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
  subscriptionStatus: 'free' | 'premium'
  premiumExpiry?: string
  phone?: string
  address?: string
  favoriteGames?: string[]
  recentGames?: string[]
  gameProgress?: Record<string, any>
  customMusicTrack?: any
  preferences?: UserPreferences
  billingInfo?: BillingInfo
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