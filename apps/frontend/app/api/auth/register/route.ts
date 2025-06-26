import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { strapiApi } from '@/lib/api/strapi'
import { AxiosError } from 'axios'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, subscriptionType } = body

    try {
      // Register user in Strapi
      const { data: userData } = await strapiApi.post('/auth/local/register', {
        email,
        username,
        password,
      })

      // Create user profile with subscription type
      await strapiApi.post('/users', {
        data: {
          email,
          username,
          subscriptionType,
          registrationDate: new Date().toISOString(),
          isActive: true,
          // Set subscription expiry for premium users (e.g., 1 year from now)
          ...(subscriptionType === 'premium' && {
            subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          })
        }
      }, {
        headers: {
          Authorization: `Bearer ${userData.jwt}`
        }
      })

      // Set JWT cookie
      cookies().set('jwt', userData.jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })

      return NextResponse.json({
        user: {
          id: userData.user.id,
          email: userData.user.email,
          username: userData.user.username,
          subscriptionType
        }
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        return NextResponse.json(
          { error: { message: error.response?.data?.error?.message || 'Registration failed' } },
          { status: error.response?.status || 400 }
        )
      }
      throw error
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'An error occurred during registration' } },
      { status: 500 }
    )
  }
} 