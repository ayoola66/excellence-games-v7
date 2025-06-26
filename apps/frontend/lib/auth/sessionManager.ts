import jwt from 'jsonwebtoken'
import { AuthError, AuthErrorType } from '../errors/authErrors'

export interface SessionInfo {
  userId: number
  email: string
  isAdmin: boolean
  exp?: number
  iat?: number
}

/**
 * Extracts session information from a JWT token
 * @param token The JWT token to extract info from
 * @returns The session info object
 * @throws AuthError if token is invalid
 */
export function extractSessionInfo(token: string | null): SessionInfo | null {
  if (!token) return null
  
  try {
    // Decode token without verifying signature
    const decoded = jwt.decode(token)
    
    if (!decoded || typeof decoded !== 'object') {
      throw new AuthError(AuthErrorType.INVALID_TOKEN, {
        message: 'Invalid token format'
      })
    }
    
    // Extract relevant fields
    const { id: userId, email, isAdmin, exp, iat } = decoded
    
    if (!userId || !email) {
      throw new AuthError(AuthErrorType.INVALID_TOKEN, {
        message: 'Missing required token claims'
      })
    }
    
    return {
      userId: Number(userId),
      email,
      isAdmin: Boolean(isAdmin),
      exp,
      iat
    }
  } catch (error) {
    if (error instanceof AuthError) throw error
    
    throw new AuthError(AuthErrorType.INVALID_TOKEN, {
      message: 'Failed to decode token',
      cause: error
    })
  }
}

/**
 * Checks if a token is expired
 * @param token The JWT token to check
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  
  try {
    const decoded = jwt.decode(token)
    if (!decoded || typeof decoded !== 'object' || !decoded.exp) return true
    
    const expiryDate = new Date(decoded.exp * 1000)
    const now = new Date()
    
    return expiryDate <= now
  } catch (error) {
    return true
  }
}

/**
 * Checks if a token needs to be refreshed soon
 * @param token The JWT token to check
 * @param refreshThresholdMinutes Minutes before expiry to trigger refresh
 * @returns true if token should be refreshed, false otherwise
 */
export function shouldRefreshToken(
  token: string | null, 
  refreshThresholdMinutes: number = 5
): boolean {
  if (!token) return true
  
  try {
    const decoded = jwt.decode(token)
    if (!decoded || typeof decoded !== 'object' || !decoded.exp) return true
    
    const expiryDate = new Date(decoded.exp * 1000)
    const now = new Date()
    const thresholdDate = new Date(
      now.getTime() + refreshThresholdMinutes * 60 * 1000
    )
    
    return thresholdDate >= expiryDate
  } catch (error) {
    return true
  }
} 