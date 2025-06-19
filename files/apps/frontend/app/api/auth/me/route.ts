import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('userToken') || cookieStore.get('clientUserToken')

    if (!token) {
      console.warn('[API/auth/me] No authentication token found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    try {
      console.log(`[API/auth/me] Using token: ${token.name}=${token.value.substring(0, 10)}...`);

      const response = await axios.get(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      const userData = response.data;
      console.log('[API/auth/me] User data retrieved successfully');

      return NextResponse.json(
        { user: {
            id: userData.id,
            email: userData.email,
            username: userData.username,
            fullName: userData.fullName || userData.username,
            role: userData.role?.type || 'authenticated',
            subscriptionStatus: userData.subscriptionStatus || 'free'
          } },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    } catch (error: any) {
      console.error('[API/auth/me] Strapi API error:', error.response?.data || error.message);
      
      // Clear invalid tokens
      if (error.response?.status === 401) {
        cookieStore.set('userToken', '', { maxAge: 0, path: '/' });
        cookieStore.set('clientUserToken', '', { maxAge: 0, path: '/' });
      }
      
      return NextResponse.json(
        { error: error.response?.data?.message || 'Authentication failed' },
        { status: error.response?.status || 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }
  } catch (error: any) {
    console.error('[API/auth/me] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, currentPassword, newPassword } = body
    
    const cookieStore = cookies()
    const token = cookieStore.get('userToken') || cookieStore.get('clientUserToken')

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    try {
      const response = await axios.put(`${API_URL}/api/users/me`, {
        fullName,
        email,
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      return NextResponse.json(response.data)
    } catch (error: any) {
      console.error('[API/auth/me] Update profile error:', error.response?.data || error.message);
      const status = error.response?.status || 500
      const message = error.response?.data?.error?.message || 'Failed to update profile'
      return NextResponse.json({ error: message }, { status })
    }
  } catch (error: any) {
    console.error('[API/auth/me] Unexpected error during profile update:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 