import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use Strapi's v4 admin auth endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}/admin/login`, {
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
      console.error('Admin login error:', {
        status: response.status,
        data
      })
      return NextResponse.json(
        { error: data.error?.message || 'Invalid credentials' },
        { status: response.status }
      )
    }

    // Set HTTP-only cookie with the admin JWT
    cookies().set('adminToken', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours (Strapi admin tokens expire in 30 days by default)
      path: '/'
    })

    return NextResponse.json({
      user: {
        id: data.data.user.id,
        email: data.data.user.email,
        firstname: data.data.user.firstname,
        lastname: data.data.user.lastname,
        username: data.data.user.username,
        isAdmin: true
      }
    })
  } catch (error: any) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 