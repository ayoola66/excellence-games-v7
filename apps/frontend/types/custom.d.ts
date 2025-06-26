declare module '@/context/auth' {
  interface Admin {
    id: string
    email: string
    fullName?: string
    adminType: string
    permissions: string[]
  }

  export function useAuth(): {
    admin: Admin | null
    setAdmin: (admin: Admin | null) => void
  }
}

declare module '@/lib/middleware/rateLimiter' {
  import { NextRequest, NextResponse } from 'next/server'
  export function adminLoginRateLimiter(req: NextRequest): Promise<NextResponse | null>
}

declare module '@/lib/auth/securityUtils' {
  export function validateEmail(email: string): boolean
}

declare module '@/lib/auth/tokenManager' {
  import { NextResponse } from 'next/server'
  
  interface AuthTokens {
    accessToken: string
    refreshToken?: string
  }
  
  export function setAdminAuthTokens(response: NextResponse, tokens: AuthTokens): void
}

declare module '@/lib/errors/authErrors' {
  export enum AuthErrorType {
    INVALID_REQUEST = 'INVALID_REQUEST',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    NETWORK_ERROR = 'NETWORK_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    ACCOUNT_DISABLED = 'ACCOUNT_DISABLED'
  }

  interface AuthErrorOptions {
    message: string
    status?: number
    details?: Record<string, any>
  }

  export class AuthError extends Error {
    constructor(type: AuthErrorType, options: AuthErrorOptions)
    toJSON(): { error: { type: AuthErrorType; message: string; details?: Record<string, any> } }
  }

  export function logAuthError(error: AuthError, context: { path: string }): void
}

declare module '@/lib/auth/sessionManager' {
  interface SessionData {
    userId: string
    email: string
    role: string
    isAdmin: boolean
  }

  export function registerSession(userId: string, data: SessionData): Promise<void>
}

declare module '@/lib/api' {
  import { AxiosInstance } from 'axios'
  export const api: AxiosInstance
  export const strapiApi: AxiosInstance
}

declare module '@/lib/toast' {
  interface Toast {
    success(message: string): void
    error(message: string): void
    warning(message: string): void
    info(message: string): void
  }

  export const compatToast: Toast
} 