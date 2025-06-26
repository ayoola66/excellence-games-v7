import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateRefreshToken } from './securityUtils'

interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

interface TokenOptions {
  maxAge?: number
  path?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

const defaultTokenOptions: TokenOptions = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
}

/**
 * Sets admin authentication tokens in cookies
 */
export async function setAdminAuthTokens(tokens: AuthTokens, options: TokenOptions = {}): Promise<void> {
  const tokenOptions = { ...defaultTokenOptions, ...options }
  const cookieStore = await cookies()

  // Set HTTP-only cookie for access token
  cookieStore.set('adminToken', tokens.accessToken, {
    ...tokenOptions,
    httpOnly: true
  })

  // Set HTTP-only cookie for refresh token if provided
  if (tokens.refreshToken) {
    cookieStore.set('adminRefreshToken', tokens.refreshToken, {
      ...tokenOptions,
      httpOnly: true
    })
  }

  // Set client-accessible cookie for frontend use
  cookieStore.set('clientAdminToken', tokens.accessToken, {
    ...tokenOptions,
    httpOnly: false
  })
}

/**
 * Gets admin authentication tokens from cookies
 */
export async function getAdminAuthTokens(): Promise<AuthTokens> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('adminToken')?.value || ''
  const refreshToken = cookieStore.get('adminRefreshToken')?.value
  return {
    accessToken,
    refreshToken
  }
}

/**
 * Clears admin authentication tokens from cookies
 */
export async function clearAdminAuthTokens(): Promise<void> {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0
  }

  const cookieStore = await cookies()
  cookieStore.set('adminToken', '', options)
  cookieStore.set('adminRefreshToken', '', options)
  cookieStore.set('clientAdminToken', '', { ...options, httpOnly: false })
}

/**
 * Sets user authentication tokens in cookies with proper synchronization
 */
export async function setUserAuthTokens(tokens: AuthTokens, options: TokenOptions = {}): Promise<void> {
  const tokenOptions = { ...defaultTokenOptions, ...options }
  const cookieStore = await cookies()

  // Set tokens atomically to prevent race conditions
  await Promise.all([
    // Set HTTP-only cookie for access token
    cookieStore.set('userToken', tokens.accessToken, {
      ...tokenOptions,
      httpOnly: true
    }),

    // Set HTTP-only cookie for refresh token if provided
    tokens.refreshToken && cookieStore.set('userRefreshToken', tokens.refreshToken, {
      ...tokenOptions,
      httpOnly: true,
      maxAge: 60 * 24 * 60 * 60 // 60 days for refresh token
    }),

    // Set client-accessible cookie for frontend use
    cookieStore.set('clientUserToken', tokens.accessToken, {
      ...tokenOptions,
      httpOnly: false
    })
  ])
}

/**
 * Gets user authentication tokens from cookies with validation
 */
export async function getUserAuthTokens(): Promise<AuthTokens> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('userToken')?.value
  const refreshToken = cookieStore.get('userRefreshToken')?.value
  const clientToken = cookieStore.get('clientUserToken')?.value

  // Validate token synchronization
  if (accessToken && clientToken && accessToken !== clientToken) {
    console.warn('[TokenManager] Token synchronization mismatch detected')
    // Clear tokens if they're out of sync
    await clearUserAuthTokens()
    return { accessToken: '', refreshToken: undefined }
  }

  return {
    accessToken: accessToken || '',
    refreshToken
  }
}

/**
 * Clears user authentication tokens from cookies
 */
export async function clearUserAuthTokens(): Promise<void> {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0
  }

  const cookieStore = await cookies()
  cookieStore.set('userToken', '', options)
  cookieStore.set('userRefreshToken', '', options)
  cookieStore.set('clientUserToken', '', { ...options, httpOnly: false })
}

/**
 * Gets the user token from cookies
 */
export async function getUserToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('userToken')?.value
}

/**
 * Gets the admin token from cookies
 */
export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('adminToken')?.value
} 