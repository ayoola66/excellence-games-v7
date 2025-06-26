import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(request: NextRequest) {
  try {
    // Validate authentication - Fail fast if no token
    const cookieStore = cookies()
    const userToken = cookieStore.get('userToken')?.value
    const clientToken = cookieStore.get('clientUserToken')?.value
    const token = userToken || clientToken

    if (!token) {
      console.warn('[API/user/stats] No user token found in cookies')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    console.log('[API/user/stats] Fetching user stats from Strapi')

    // Fetch user stats from Strapi
    try {
      const response = await axios.get(`${API_URL}/api/user-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.data) {
        throw new Error('Invalid response from server')
      }

      // Transform the response to match our interface
      const stats = {
        gamesPlayed: response.data.gamesPlayed || 0,
        gamesCompleted: response.data.gamesCompleted || 0,
        totalScore: response.data.totalScore || 0,
        averageScore: response.data.averageScore || 0
      }

      console.log('[API/user/stats] Successfully fetched user stats')
      return NextResponse.json(stats)
    } catch (apiError: any) {
      console.error('[API/user/stats] API request failed:', {
        message: apiError.message,
        status: apiError.response?.status,
        data: apiError.response?.data
      })

      if (apiError.response?.status === 401) {
        return NextResponse.json(
          { error: 'Session expired - Please log in again' },
          { status: 401 }
        )
      }

      if (apiError.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'Unable to connect to the stats server' },
          { status: 503 }
        )
      }

      throw apiError // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('[API/user/stats] Unhandled error:', error)

    return NextResponse.json(
      { 
        error: 'Failed to fetch user stats',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
} 