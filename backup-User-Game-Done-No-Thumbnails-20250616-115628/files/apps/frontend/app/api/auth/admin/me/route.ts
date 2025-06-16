import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { api } from '@/lib/api'

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
    const response = await api.post('/admin-users/verify-session', {
      token: adminToken
    })

    if (!response.data || !response.data.data || !response.data.data.admin) {
      // Clear invalid token
      cookies().set('adminToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      })
      
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { admin } = response.data.data

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        adminType: admin.adminType,
        badge: admin.badge,
        permissions: admin.permissions
      }
    })
  } catch (error: any) {
    console.error('Admin session check error:', error)
    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 401 }
    )
  }
} 