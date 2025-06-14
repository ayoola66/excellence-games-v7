import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the cookie token
    const cookieStore = cookies()
    const token = cookieStore.get('userToken')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Make request directly to Strapi with proper Authorization header
    const response = await axios.get(`${API_URL}/api/games/${params.id}?populate[categories][populate]=*&populate[questions][populate]=*`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })

    // Log response for debugging
    console.log('Game fetch response:', {
      status: response.status,
      data: response.data
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    // Log detailed error for debugging
    console.error('Game fetch error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'You do not have permission to access this game' },
        { status: 403 }
      )
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch game', details: error.response?.data?.error || error.message },
      { status: 500 }
    )
  }
} 