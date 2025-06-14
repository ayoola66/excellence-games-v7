import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('userToken')

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const response = await axios.get(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    return NextResponse.json(
      { user: response.data },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error: any) {
    console.error('Auth check error:', error.response?.data || error.message)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, currentPassword, newPassword } = body

    const response = await axios.put(`${API_URL}/users/me`, {
      fullName,
      email,
      currentPassword,
      newPassword,
    }, {
      headers: {
        Authorization: `Bearer ${cookies().get('userToken')?.value}`,
      },
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('Failed to update user profile:', error)
    const status = error.response?.status || 500
    const message = error.response?.data?.error?.message || 'Internal server error'
    return NextResponse.json({ error: message }, { status })
  }
} 