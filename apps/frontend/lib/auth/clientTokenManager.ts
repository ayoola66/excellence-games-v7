import { getCookie, setCookie, deleteCookie } from 'cookies-next'

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
 * Gets user authentication tokens from cookies
 */
export function getClientAuthTokens(): AuthTokens {
  const accessToken = getCookie('userToken')?.toString() || ''
  const refreshToken = getCookie('userRefreshToken')?.toString()
  const clientToken = getCookie('clientUserToken')?.toString()

  // Validate token synchronization
  if (accessToken && clientToken && accessToken !== clientToken) {
    console.warn('[TokenManager] Token synchronization mismatch detected')
    // Clear tokens if they're out of sync
    clearClientAuthTokens()
    return { accessToken: '', refreshToken: undefined }
  }

  return {
    accessToken: accessToken || '',
    refreshToken
  }
}

/**
 * Sets user authentication tokens in cookies
 */
export function setClientAuthTokens(tokens: AuthTokens, options: TokenOptions = {}): void {
  const tokenOptions = { ...defaultTokenOptions, ...options }

  // Set tokens
  setCookie('userToken', tokens.accessToken, {
    ...tokenOptions,
    httpOnly: true
  })

  if (tokens.refreshToken) {
    setCookie('userRefreshToken', tokens.refreshToken, {
      ...tokenOptions,
      httpOnly: true,
      maxAge: 60 * 24 * 60 * 60 // 60 days for refresh token
    })
  }

  setCookie('clientUserToken', tokens.accessToken, {
    ...tokenOptions,
    httpOnly: false
  })
}

/**
 * Clears user authentication tokens from cookies
 */
export function clearClientAuthTokens(): void {
  const options = {
    path: '/'
  }

  deleteCookie('userToken', options)
  deleteCookie('userRefreshToken', options)
  deleteCookie('clientUserToken', options)
} 