import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.getGame(params.id)
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Game not found' },
      { status: 404 }
    )
  }
} 