import { NextRequest, NextResponse } from 'next/server';
import { strapiApi } from '@/lib/strapiApi';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to Strapi
    const response = await strapiApi.get('/api/categories?populate=*');
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to Strapi
    const response = await strapiApi.post('/api/categories', {
      data: body
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: error.response?.status || 500 }
    );
  }
} 