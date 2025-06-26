import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { strapiUrl } from '@/lib/api'

export async function GET() {
  try {
    const adminToken = cookies().get('adminAccessToken')?.value

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch stats from Strapi
    const response = await fetch(`${strapiUrl}/api/admin/stats`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch stats from Strapi')
    }

    const data = await response.json()

    return NextResponse.json({
      totalUsers: data.totalUsers || 0,
      activeUsers: data.activeUsers || 0,
      totalGames: data.totalGames || 0,
      totalQuestions: data.totalQuestions || 0,
      totalOrders: data.totalOrders || 0,
      revenue: data.revenue || 0
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
} 