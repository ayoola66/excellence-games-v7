import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET() {
  try {
    const adminToken = cookies().get('adminToken')?.value

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify the admin session
    const response = await axios.get(`${strapiUrl}/admin/users/me`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      timeout: 5000 // 5 second timeout
    })

    // Handle 401/403 responses
    if (response.status === 401 || response.status === 403) {
      // Clear invalid token
      cookies().set('adminToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      })
      
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Handle other error responses
    if (!response.data) {
      return NextResponse.json(
        { error: 'Invalid response from auth server' },
        { status: 500 }
      )
    }

    const user = response.data
    
    // Set a new cookie with extended expiry (7 days)
    cookies().set('adminToken', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({
      admin: {
        id: user.id,
        email: user.email,
        fullName: user.firstname + ' ' + user.lastname,
        adminType: user.roles[0]?.name || 'Editor',
        badge: user.roles[0]?.name || '',
        permissions: user.roles.reduce((acc: string[], role: any) => {
          if (role.permissions) {
            acc.push(...role.permissions.map((p: any) => p.action))
          }
          return acc
        }, [])
      }
    })
  } catch (error: any) {
    console.error('Admin session check error:', error.response?.data || error)
    
    // Don't clear token or return error on network issues
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || axios.isAxiosError(error)) {
      // Return the last known admin state
      return NextResponse.json({
        admin: null,
        error: 'Network error, using cached state',
        shouldRetry: true
      }, { status: 200 })
    }

    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 401 }
    )
  }
} 