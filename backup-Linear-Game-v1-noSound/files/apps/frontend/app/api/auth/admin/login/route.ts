import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { api } from '@/lib/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Call the admin login endpoint
    const response = await api.post('/admin-user-profiles/login', {
      email,
      password,
    })

    if (!response.data) {
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      )
    }

    const { token, admin } = response.data

    // Set the admin token in an HTTP-only cookie
    cookies().set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 // 8 hours
    })

    // Return admin data without sensitive information
    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName || admin.username,
        adminType: admin.adminType,
        permissions: admin.permissions || []
      }
    })
  } catch (error: any) {
    console.error('Admin login error:', error.response?.data || error)
    const status = error.response?.status || 500
    const message = error.response?.data?.error || 'Authentication failed'
    return NextResponse.json({ error: message }, { status })
  }
} 