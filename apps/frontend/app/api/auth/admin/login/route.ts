import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: { type: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      )
    }

    console.log(`Attempting to login admin user: ${email} to ${strapiUrl}/api/admin-user/auth/login`)

    // Use the correct admin login endpoint
    const loginResponse = await fetch(`${strapiUrl}/api/admin-user/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    })

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json()
      console.error('Login failed:', {
        status: loginResponse.status,
        statusText: loginResponse.statusText,
        error: errorData
      })
      return NextResponse.json(
        { error: { type: 'AUTH_ERROR', message: errorData.error?.message || 'Failed to authenticate' } },
        { status: loginResponse.status }
      )
    }

    const responseData = await loginResponse.json()
    const { jwt: token, refreshToken, user: adminUser } = responseData

    if (!token || !adminUser) {
      console.error('Invalid response data:', responseData)
      return NextResponse.json(
        { error: { type: 'SERVER_ERROR', message: 'Invalid response from authentication server' } },
        { status: 500 }
      )
    }

    // Create the response with auth tokens
    const response = NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        displayRole: adminUser.displayRole,
        badge: adminUser.badge,
        permissions: adminUser.permissions,
        allowedSections: adminUser.allowedSections
      }
    })

    // Set the auth tokens as HTTP-only cookies matching tokenManager expectations
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    if (refreshToken) {
      // HTTP-only server cookie for admin refresh token
      response.cookies.set('adminRefreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }

    // Client-accessible cookie for frontend auth context
    response.cookies.set('clientAdminToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return response
  } catch (error: any) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { 
        error: { 
          type: 'SERVER_ERROR', 
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        } 
      },
      { status: 500 }
    )
  }
} 