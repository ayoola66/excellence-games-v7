import { NextRequest, NextResponse } from 'next/server';
import { strapiApi } from '@/lib/strapiApi';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Create a new FormData instance to send to Strapi
    const strapiFormData = new FormData();
    strapiFormData.append('file', file);
    
    // Get the token from the request cookies
    const authHeader = request.headers.get('Authorization');
    
    // Forward the request to Strapi
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/questions/import`, {
      method: 'POST',
      body: strapiFormData,
      headers: {
        Authorization: authHeader || '',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to import questions');
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error importing questions:', error);
    return NextResponse.json(
      { error: 'Failed to import questions', details: error.message },
      { status: 500 }
    );
  }
} 