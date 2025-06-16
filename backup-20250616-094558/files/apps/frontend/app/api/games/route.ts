import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(request: NextRequest) {
  try {
    // Get the cookie token
    const cookieStore = cookies()
    const token = cookieStore.get('userToken')

    if (!token) {
      console.warn('No user token found in cookies')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ----- Development debug (token snippet) -----
    // console.debug('Token OK:', token.value.substring(0, 10) + '…')
    // ---------------------------------------------

    // Make request directly to Strapi with proper Authorization header
    const response = await axios.get(`${API_URL}/api/games?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.data?.data) {
      console.warn('No games data in response:', response.data)
      return NextResponse.json({ data: [] })
    }

    // Return the raw Strapi response
    return NextResponse.json(response.data)
  } catch (error: any) {
    // Log detailed error for debugging
    console.error('Games fetch error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    })
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in again' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch games', details: error.response?.data?.error || error.message },
      { status: 500 }
    )
  }
} 