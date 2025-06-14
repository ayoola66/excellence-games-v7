import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const token = cookies().get('adminToken')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify admin session with Strapi v4
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}/admin/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      // If token is invalid, clear it
      if (response.status === 401) {
        cookies().set('adminToken', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/'
        })
      }
      
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      id: data.data.id,
      email: data.data.email,
      firstname: data.data.firstname,
      lastname: data.data.lastname,
      username: data.data.username,
      isAdmin: true
    })
  } catch (error) {
    console.error('Admin session verification error:', error)
    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 500 }
    )
  }
} 