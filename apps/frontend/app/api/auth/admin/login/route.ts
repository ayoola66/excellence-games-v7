import { NextRequest, NextResponse } from 'next/server'
import { adminLoginRateLimiter } from '@/lib/middleware/rateLimiter'
import { validateEmail } from '@/lib/auth/securityUtils'
import { setAdminAuthTokens } from '@/lib/auth/tokenManager'
import { AuthError, AuthErrorType, logAuthError } from '@/lib/errors/authErrors'

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await adminLoginRateLimiter(req)
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Parse request body
    const body = await req.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      throw new AuthError(AuthErrorType.INVALID_REQUEST, {
        message: 'Email and password are required'
      })
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw new AuthError(AuthErrorType.INVALID_REQUEST, {
        message: 'Invalid email format'
      })
    }

    console.log(`[AUTH] Admin login attempt for: ${email}`)

    try {
      // Use the correct admin login endpoint
      const response = await fetch(`${strapiUrl}/api/admin-user/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new AuthError(
          response.status === 401 ? AuthErrorType.INVALID_CREDENTIALS : AuthErrorType.SERVER_ERROR,
          {
            message: data?.error || 'Authentication failed'
          }
        )
      }

      const token = data?.data?.token
      const adminData = data?.data?.admin

      if (!token || !adminData) {
        throw new AuthError(AuthErrorType.SERVER_ERROR, {
          message: 'Invalid response from authentication server'
        })
      }

      // Create response object
      const nextResponse = NextResponse.json({ admin: adminData })

      // Set authentication tokens
      setAdminAuthTokens(nextResponse, {
        accessToken: token,
        refreshToken: token + '_refresh' // Simple refresh token for now
      })

      // Log successful login
      console.log(`[AUTH] Admin login successful: ${email}`)

      return nextResponse
    } catch (error: any) {
      // Handle authentication errors
      if (error instanceof AuthError) {
        logAuthError(error, { path: '/api/auth/admin/login' })
        return NextResponse.json(
          { error: error.toJSON().error },
          { status: error.status }
        )
      }

      // Handle network errors
      if (error.message && error.message.includes('fetch')) {
        return NextResponse.json(
          { 
            error: {
              type: AuthErrorType.NETWORK_ERROR,
              message: 'Could not connect to authentication server'
            }
          },
          { status: 503 }
        )
      }

      // Handle other errors
      console.error('[AUTH] Unexpected error:', error)
      return NextResponse.json(
        { 
          error: {
            type: AuthErrorType.SERVER_ERROR,
            message: 'An unexpected error occurred'
          }
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    // Handle outer errors
    console.error('[AUTH] Outer error:', error)

    if (error instanceof AuthError) {
      logAuthError(error, { path: '/api/auth/admin/login' })
      return NextResponse.json(
        { error: error.toJSON().error },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { 
        error: {
          type: AuthErrorType.SERVER_ERROR,
          message: 'An unexpected error occurred'
        }
      },
      { status: 500 }
    )
  }
} 