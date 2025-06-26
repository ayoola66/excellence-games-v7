import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { strapiApi } from '@/lib/api/strapi'
import { userLoginRateLimiter } from '@/lib/middleware/rateLimiter'
import { validateEmail } from '@/lib/auth/securityUtils'
import { setUserAuthTokens } from '@/lib/auth/tokenManager'
import { AuthError, AuthErrorType, logAuthError } from '@/lib/errors/authErrors'

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await userLoginRateLimiter(req)
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

    // Check if this email exists in the admin-user collection (not allowed for user login)
    try {
      const adminCheck = await strapiApi.get(`/admin-user-profiles?filters[email][$eq]=${encodeURIComponent(email)}`)
      if (adminCheck.data?.data?.length > 0) {
        throw new AuthError(AuthErrorType.FORBIDDEN, {
          message: 'This email is registered as an admin. Please use the admin login.'
        })
      }
    } catch (error: any) {
      if (error instanceof AuthError) throw error
      console.warn('[AUTH] Admin check failed:', error.response?.data || error)
      // Continue with login attempt even if admin check fails
    }

    // Log the request (but not the password)
    console.log(`[AUTH] User login attempt for: ${email}`)

    // Clear any existing tokens before attempting login
    cookies().set('userToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })
    
    cookies().set('clientUserToken', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })

    try {
      // Attempt to login with Strapi
      const response = await fetch(`${strapiUrl}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      })

      // Check content type for HTML responses
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
        throw new AuthError(AuthErrorType.SERVER_ERROR, {
          message: 'Authentication server returned an invalid response format'
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new AuthError(
          response.status === 401 ? AuthErrorType.INVALID_CREDENTIALS : AuthErrorType.SERVER_ERROR,
          {
            message: data.error?.message || 'Authentication failed'
          }
        )
      }

      if (!data.jwt || !data.user) {
        throw new AuthError(AuthErrorType.SERVER_ERROR, {
          message: 'Invalid response from authentication server'
        })
      }

      // Set authentication tokens
      setUserAuthTokens({ accessToken: data.jwt })

      // Create the response with user data
      const nextResponse = NextResponse.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          fullName: data.user.fullName || data.user.username,
          role: data.user.role?.type || 'authenticated',
          subscriptionStatus: data.user.subscriptionStatus || 'free'
        }
      })

      // Log successful login
      console.log(`[AUTH] User login successful: ${email}`)

      return nextResponse
    } catch (error: any) {
      // Handle authentication errors
      if (error instanceof AuthError) {
        logAuthError(error, { path: '/api/auth/login' })
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
      logAuthError(error, { path: '/api/auth/login' })
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