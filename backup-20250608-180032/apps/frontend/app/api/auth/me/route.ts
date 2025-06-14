import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const token = cookies().get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      // If token is invalid, clear it
      if (response.status === 401) {
        cookies().set('token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 0
        })
      }

      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Session verification failed' },
        { status: response.status }
      )
    }

    const userData = await response.json()
    
    // Return user data without sensitive information
    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      fullName: userData.fullName,
      subscriptionStatus: userData.subscriptionStatus,
      premiumExpiry: userData.premiumExpiry
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 