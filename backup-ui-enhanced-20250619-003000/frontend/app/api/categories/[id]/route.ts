import { NextRequest, NextResponse } from 'next/server';
import { strapiApi } from '@/lib/strapiApi';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Forward the request to Strapi
    const response = await strapiApi.get(`/api/categories/${params.id}?populate=*`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching category ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Forward the request to Strapi
    const response = await strapiApi.updateCategory(params.id, body);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error updating category ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Forward the request to Strapi
    const response = await strapiApi.delete(`/api/categories/${params.id}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(`Error deleting category ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: error.response?.status || 500 }
    );
  }
} 