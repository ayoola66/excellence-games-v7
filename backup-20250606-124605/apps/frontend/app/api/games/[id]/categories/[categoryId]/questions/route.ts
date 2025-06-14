import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeIds = searchParams.get('excludeIds')?.split(',') || []
    
    const response = await api.getCategoryQuestions(
      params.id, 
      params.categoryId, 
      excludeIds
    )
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'No more questions available' },
      { status: 404 }
    )
  }
} 