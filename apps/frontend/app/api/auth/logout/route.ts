import { NextRequest, NextResponse } from 'next/server'
import { strapiApi } from '@/lib/api/strapi'
import { getUserAuthTokens, clearUserAuthTokens } from '@/lib/auth/tokenManager'
import { AuthError, AuthErrorType } from '@/lib/errors/authErrors'

export async function POST(req: NextRequest) {
  try {
    // Get current tokens
    const { accessToken } = getUserAuthTokens()
    
    if (accessToken) {
      try {
        // Notify Strapi about logout
        await strapiApi.post('/api/auth/logout', null, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      } catch (error: any) {
        // Log but don't throw - we want to clear cookies regardless
        console.warn('[AUTH] Error notifying Strapi about user logout:', error.response?.data || error)
      }
    }

    // Create response
    const response = NextResponse.json({ success: true })
    
    // Clear auth cookies
    clearUserAuthTokens(response)
    
    // Log successful logout
    console.log('[AUTH] User logged out successfully')
    
    return response
  } catch (error: any) {
    // Handle unexpected errors
    console.error('[AUTH] Unexpected error in logout:', error)
    
    // Create error response
    const response = NextResponse.json(
      { 
        error: {
          type: AuthErrorType.UNKNOWN_ERROR,
          message: 'An unexpected error occurred during logout'
        }
      },
      { status: 500 }
    )
    
    // Clear cookies even if there was an error
    clearUserAuthTokens(response)
    
    return response
  }
} 