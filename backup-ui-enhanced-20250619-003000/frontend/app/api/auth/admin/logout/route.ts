import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { api } from '@/lib/api'

export async function POST() {
  try {
    // Get the admin token
    const adminToken = cookies().get('adminToken')?.value

    if (adminToken) {
      // Set the token in the Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`

      try {
        // Call Strapi logout endpoint
        await api.post('/admin/logout')
      } catch (error) {
        // Continue with local logout even if server logout fails
        console.warn('Server logout failed:', error)
      }
    }

    // Clear the admin token cookie
    cookies().set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    // Still return success since we've cleared the cookie
    return NextResponse.json({ message: 'Logged out successfully' })
  }
} 