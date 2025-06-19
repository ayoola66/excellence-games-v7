import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('userToken') || cookieStore.get('clientUserToken')

    if (!token) {
      console.warn('[API] No user token found in cookies')
      return NextResponse.json(
        { error: 'Unauthorized - No token found' },
        { status: 401 }
      )
    }

    console.log(`[API] Using token: ${token.name}=${token.value.substring(0, 10)}...`)

    // Fetch games with all related data
    const response = await axios.get(`${API_URL}/api/games`, {
      params: {
        'populate[0]': 'thumbnail',
        'populate[1]': 'categories',
        'populate[2]': 'questions'
      },
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`[API] Games response status: ${response.status}`)
    
    if (!response.data || !response.data.data) {
      console.warn('[API] No data in Strapi response')
      return NextResponse.json({ data: [] })
    }

    // Transform Strapi response to match frontend expectations
    const transformedData = response.data.data.map((game: any) => ({
      id: game.id,
      name: game.attributes.title || game.attributes.name,
      description: game.attributes.description,
      type: game.attributes.type?.toLowerCase(),
      status: game.attributes.status,
      totalQuestions: game.attributes.totalQuestions,
      thumbnail: game.attributes.thumbnail?.data?.attributes?.url 
        ? `${API_URL}${game.attributes.thumbnail.data.attributes.url}`
        : null,
      categories: game.attributes.categories?.data?.map((cat: any) => ({
        id: cat.id,
        name: cat.attributes.name
      })) || []
    }))

    return NextResponse.json({ data: transformedData })
  } catch (error: any) {
    console.error('[API] Games fetch error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Session expired - Please log in again' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch games' },
      { status: 500 }
    )
  }
} 