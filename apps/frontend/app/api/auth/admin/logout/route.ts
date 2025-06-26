import { NextRequest, NextResponse } from 'next/server'
import { strapiApi } from '@/lib/api/strapi'
import { getAdminAuthTokens, clearAdminAuthTokens } from '@/lib/auth/tokenManager'
import { AuthError, AuthErrorType } from '@/lib/errors/authErrors'

export async function POST(req: NextRequest) {
  try {
    // Get current tokens
    const { accessToken } = getAdminAuthTokens()
    
    if (accessToken) {
      try {
        // Notify Strapi about logout
        await strapiApi.post('/admin/logout', null, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      } catch (error: any) {
        // Log but don't throw - we want to clear cookies regardless
        console.warn('[AUTH] Error notifying Strapi about admin logout:', error.response?.data || error)
      }
    }

    // Create response
    const nextResponse = NextResponse.json({ success: true })
    
    // Clear auth cookies
    clearAdminAuthTokens(nextResponse)
    
    // Log successful logout
    console.log('[AUTH] Admin logged out successfully')
    
    return nextResponse
  } catch (error: any) {
    // Handle authentication errors
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.toJSON().error },
        { status: error.status || 500 }
      )
    }
    
    // Handle unexpected errors
    console.error('[AUTH] Unexpected error in logout:', error)
    
    return NextResponse.json(
      { 
        error: {
          type: AuthErrorType.UNKNOWN_ERROR,
          message: 'An unexpected error occurred'
        }
      },
      { status: 500 }
    )
  }
} 