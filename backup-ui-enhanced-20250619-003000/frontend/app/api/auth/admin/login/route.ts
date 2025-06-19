import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Login with Strapi admin API
    const response = await axios.post(`${strapiUrl}/admin/login`, {
      email: email,
      password: password,
      provider: 'local'
    })

    if (!response.data || !response.data.data) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const { token, user } = response.data.data

    // Check if user roles exist
    const roles = user.roles || []
    const adminType = roles[0]?.name || 'Editor'
    const badge = roles[0]?.name || ''
    const permissions = roles.reduce((acc: string[], role: any) => {
      if (role.permissions) {
        acc.push(...role.permissions.map((p: any) => p.action))
      }
      return acc
    }, [])

    // Set the token in an HTTP-only cookie
    cookies().set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60
    })

    return NextResponse.json({
      admin: {
        id: user.id,
        email: user.email,
        fullName: user.firstname + ' ' + user.lastname,
        adminType,
        badge,
        permissions
      }
    })
  } catch (error: any) {
    console.error('Admin login error:', error.response?.data || error)
    return NextResponse.json(
      { error: error.response?.data?.error?.message || 'Login failed' },
      { status: error.response?.status || 500 }
    )
  }
} 