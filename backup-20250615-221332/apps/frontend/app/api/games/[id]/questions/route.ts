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

    // Make request to Strapi with proper filters
    const response = await axios.get(
      `${API_URL}/api/questions?filters[game][id][$eq]=${params.id}&populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // Log response for debugging
    console.log('Questions fetch response:', {
      status: response.status,
      data: response.data
    })

    if (!response.data?.data || !Array.isArray(response.data.data)) {
      return NextResponse.json(
        { error: 'No questions found for this game' },
        { status: 404 }
      )
    }

    // Transform the response to match expected format
    const questions = response.data.data.map((q: any) => ({
      id: q.id,
      question: q.attributes.question,
      option1: q.attributes.option1,
      option2: q.attributes.option2,
      option3: q.attributes.option3,
      option4: q.attributes.option4,
      correctAnswer: q.attributes.correctAnswer,
      explanation: q.attributes.explanation,
      difficulty: q.attributes.difficulty || 'medium'
    }))

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for this game' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: questions })
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

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Questions not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error.response?.data?.error || error.message },
      { status: 500 }
    )
  }
} 