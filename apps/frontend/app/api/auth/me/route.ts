import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AuthError, AuthErrorType } from '@/lib/errors/authErrors'

export async function GET(req: NextRequest) {
  console.log('[API/auth/me] Request received at', new Date().toISOString(), 'Referer:', req.headers.get('referer'), 'User-Agent:', req.headers.get('user-agent'))

  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('userToken')?.value
    const refreshToken = cookieStore.get('userRefreshToken')?.value

    console.log('[API/auth/me] Checking user session. Access token present:', !!accessToken)

    if (!accessToken) {
      return NextResponse.json(
        { error: { message: 'No access token found' } },
        { status: 401 }
      )
    }

    // Make a fetch request to Strapi (avoiding axios to prevent server/client mismatch)
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: { message: error.error?.message || 'Failed to fetch user data' } },
        { status: response.status }
      )
    }

    const userData = await response.json()

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        fullName: userData.fullName || userData.username,
        role: userData.role?.type || 'authenticated',
        subscriptionStatus: userData.subscriptionStatus || 'free'
      }
    })
  } catch (error: any) {
    console.error('[AUTH] Session check error:', error)
    return NextResponse.json(
      { error: { message: 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
} 