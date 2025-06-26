declare module '@/lib/middleware/rateLimiter' {
  import { NextRequest, NextResponse } from 'next/server'
  export function adminLoginRateLimiter(req: NextRequest): Promise<NextResponse | null>
}

declare module '@/lib/auth/securityUtils' {
  export function validateEmail(email: string): boolean
}

declare module '@/lib/auth/tokenManager' {
  import { NextResponse } from 'next/server'
  export function setAdminAuthTokens(
    response: NextResponse,
    tokens: { accessToken: string; refreshToken: string },
    config?: {
      accessTokenMaxAge?: number
      refreshTokenMaxAge?: number
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
    }
  ): NextResponse
}

declare module '@/lib/errors/authErrors' {
  export enum AuthErrorType {
    INVALID_REQUEST = 'INVALID_REQUEST',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    SERVER_ERROR = 'SERVER_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    ACCOUNT_DISABLED = 'ACCOUNT_DISABLED'
  }

  export class AuthError extends Error {
    constructor(type: AuthErrorType, options?: { message?: string; status?: number })
    toJSON(): { error: { type: AuthErrorType; message: string } }
    status: number
  }

  export function logAuthError(error: AuthError, context?: { path?: string }): void
}

declare module '@/lib/auth/sessionManager' {
  export interface SessionInfo {
    userId: string
    email?: string
    role?: string
    isAdmin?: boolean
    lastActivity?: number
  }

  export function registerSession(userId: string, sessionInfo: SessionInfo): void
}

declare module '@/lib/api' {
  import { AxiosInstance } from 'axios'
  export const strapiApi: AxiosInstance & {
    post(url: string, data?: any, config?: any): Promise<any>
  }
} 