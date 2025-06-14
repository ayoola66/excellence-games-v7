import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
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

    const { searchParams } = new URL(request.url)
    const excludeIds = searchParams.get('excludeIds')?.split(',') || []
    
    // Build the query with proper population and filters
    let url = `${API_URL}/api/questions?filters[category][id][$eq]=${params.categoryId}&filters[game][id][$eq]=${params.id}&populate=*`
    
    if (excludeIds.length > 0) {
      url += `&filters[id][$notIn]=${excludeIds.join(',')}`
    }

    // Make request to Strapi
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })

    // Log response for debugging
    console.log('Questions fetch response:', {
      status: response.status,
      data: response.data
    })

    if (!response.data.data || response.data.data.length === 0) {
      return NextResponse.json(
        { error: 'No more questions available' },
        { status: 404 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error: any) {
    // Log detailed error for debugging
    console.error('Questions fetch error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })

    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'You do not have permission to access these questions' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to load questions', details: error.response?.data?.error || error.message },
      { status: 500 }
    )
  }
}