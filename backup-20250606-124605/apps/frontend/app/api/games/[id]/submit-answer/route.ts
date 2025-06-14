import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { questionId, selectedAnswer } = body
    
    const response = await api.submitAnswer(questionId, selectedAnswer)
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
} 