import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { api } from '@/lib/api'

export async function middleware(request: NextRequest) {
  try {
    const jwt = request.cookies.get('jwt')?.value

    if (!jwt) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the JWT token with the backend
    const response = await api.get('/admin/me', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })

    if (!response.data) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  } catch (error: any) {
    console.error('Admin middleware error:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: '/api/admin/:path*',
} 