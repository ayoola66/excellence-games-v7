import { NextRequest, NextResponse } from 'next/server'
import { getAdminToken } from '@/lib/auth/tokenManager'
import { AuthError, AuthErrorType } from '@/lib/errors/authErrors'

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(req: NextRequest) {
  try {
    const token = getAdminToken()

    if (!token) {
      throw new AuthError(AuthErrorType.TOKEN_INVALID, {
        message: 'No admin token found'
      })
    }

    // Verify admin session via custom endpoint
    const response = await fetch(`${strapiUrl}/api/admin-users/verify-session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthError(AuthErrorType.TOKEN_EXPIRED, {
          message: 'Admin session expired'
        })
      }
      throw new AuthError(AuthErrorType.SERVER_ERROR, {
        message: 'Failed to verify admin session'
      })
    }

    const data = await response.json()

    const adminData = data?.data?.admin || data?.admin || null

    if (!adminData) {
      throw new AuthError(AuthErrorType.SERVER_ERROR, {
        message: 'Invalid response from authentication server'
      })
    }

    return NextResponse.json({ admin: adminData })
  } catch (error: any) {
    console.error('[AUTH] Admin session check error:', error)

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.toJSON().error },
        { status: error.status }
      )
    }

    return NextResponse.json(
      {
        error: {
          type: AuthErrorType.SERVER_ERROR,
          message: 'Failed to verify admin session'
        }
      },
      { status: 500 }
    )
  }
} 