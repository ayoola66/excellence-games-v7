import { NextRequest, NextResponse } from 'next/server'
import { strapiApi } from '@/lib/api/strapi'
import { getAdminAuthTokens, setAdminAuthTokens, clearAdminAuthTokens } from '@/lib/auth/tokenManager'
import { AuthError, AuthErrorType } from '@/lib/errors/authErrors'
import { extractSessionInfo } from '@/lib/auth/sessionManager'

export async function POST(req: NextRequest) {
  try {
    // Get current tokens from cookies
    const { accessToken, refreshToken } = getAdminAuthTokens()
    
    // Check if refresh token exists
    if (!refreshToken) {
      throw new AuthError(AuthErrorType.INVALID_TOKEN, {
        message: 'No refresh token provided'
      })
    }
    
    // Extract current session info from access token (even if expired)
    const sessionInfo = extractSessionInfo(accessToken)
    
    if (!sessionInfo?.userId) {
      throw new AuthError(AuthErrorType.INVALID_TOKEN, {
        message: 'Invalid access token format'
      })
    }
    
    try {
      // Request new tokens from Strapi
      const response = await strapiApi.post('/admin/token/refresh', {
        refreshToken,
        userId: sessionInfo.userId
      })

      // Handle API response
      if (!response.data) {
        throw new AuthError(AuthErrorType.SERVER_ERROR, {
          message: 'Invalid response from authentication server'
        })
      }

      const { jwt: newAccessToken, refreshToken: newRefreshToken } = response.data
      
      if (!newAccessToken || !newRefreshToken) {
        throw new AuthError(AuthErrorType.SERVER_ERROR, {
          message: 'Missing token data in server response'
        })
      }

      // Create response
      const nextResponse = NextResponse.json({ success: true })
      
      // Set new auth tokens in cookies
      setAdminAuthTokens(nextResponse, { 
        accessToken: newAccessToken, 
        refreshToken: newRefreshToken 
      })
      
      // Log successful token refresh
      console.log(`[AUTH] Admin token refreshed for user ID: ${sessionInfo.userId}`)
      
      return nextResponse
    } catch (error: any) {
      // Handle network or server errors
      if (error instanceof AuthError) throw error

      console.error('[AUTH] Token refresh error:', error.response?.data || error)

      if (error.response?.status === 401) {
        throw new AuthError(AuthErrorType.TOKEN_EXPIRED, {
          message: 'Refresh token expired'
        })
      }

      throw new AuthError(AuthErrorType.SERVER_ERROR, {
        message: error.response?.data?.error?.message || 'Token refresh failed'
      })
    }
  } catch (error: any) {
    // Handle authentication errors
    if (error instanceof AuthError) {
      // For token errors, clear the cookies to force re-login
      if (
        error.type === AuthErrorType.TOKEN_EXPIRED || 
        error.type === AuthErrorType.INVALID_TOKEN
      ) {
        const nextResponse = NextResponse.json(
          { error: error.toJSON().error },
          { status: error.status || 401 }
        )
        clearAdminAuthTokens(nextResponse)
        return nextResponse
      }
      
      return NextResponse.json(
        { error: error.toJSON().error },
        { status: error.status || 500 }
      )
    }
    
    // Handle unexpected errors
    console.error('[AUTH] Unexpected error in token refresh:', error)
    
    // Clear cookies on error to force re-login
    const nextResponse = NextResponse.json(
      { 
        error: {
          type: AuthErrorType.UNKNOWN_ERROR,
          message: 'An unexpected error occurred'
        }
      },
      { status: 500 }
    )
    clearAdminAuthTokens(nextResponse)
    return nextResponse
  }
} 