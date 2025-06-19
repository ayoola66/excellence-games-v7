import { NextRequest, NextResponse } from 'next/server';
import axios from '@/lib/axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the request cookies
    const cookies = request.cookies;
    const token = cookies.get('clientUserToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from the request
    const userResponse = await axios.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const userId = userResponse.data.id;

    // Fetch progress from Strapi
    const progressResponse = await axios.get(
      `/api/question-progresses/game/${params.id}/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return NextResponse.json(progressResponse.data);
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the request cookies
    const cookies = request.cookies;
    const token = cookies.get('clientUserToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from the request
    const userResponse = await axios.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const userId = userResponse.data.id;
    const body = await request.json();
    
    // Update the request body with user ID and game ID
    const updateData = {
      ...body,
      userId,
      gameId: params.id
    };

    // Send update to Strapi
    const updateResponse = await axios.post(
      '/api/question-progresses/update',
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return NextResponse.json(updateResponse.data);
  } catch (error: any) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.response?.status || 500 }
    );
  }
} 