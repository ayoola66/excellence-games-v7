import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { strapiApi } from '@/lib/strapiApi'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch game with proper includes
    const gameResponse = await strapiApi.getGame(params.id)
    if (!gameResponse?.data) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const game = gameResponse.data
    
    // Check user permissions for premium games
    if (game.attributes?.status === 'premium') {
      const userResponse = await strapiApi.getCurrentUser()
      
      if (!userResponse?.premium) {
        return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
      }
    }

    return NextResponse.json(game)
  } catch (error: any) {
    console.error('Game fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch game' }, 
      { status: 500 }
    )
  }
}