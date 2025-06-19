import { NextRequest, NextResponse } from 'next/server';
import { strapiApi } from '@/lib/strapiApi';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const data = await request.json();
    
    // Create categories for the game
    const result = await strapiApi.createCategories(gameId, data.categories);
    
    return NextResponse.json({
      success: true,
      categories: result
    });
  } catch (error: any) {
    console.error('Error creating categories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create categories' }, 
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    
    // Get categories for the game
    const result = await strapiApi.getCategories(gameId);
    
    return NextResponse.json({
      success: true,
      categories: result
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' }, 
      { status: 500 }
    );
  }
} 