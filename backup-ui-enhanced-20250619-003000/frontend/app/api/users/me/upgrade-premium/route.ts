import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // In a real application, this would integrate with a payment processor
    // For demonstration purposes, we're just updating the user's premium status in Strapi
    
    // Get the user ID from the session
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    // Get the access token
    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token not found' }, { status: 400 });
    }
    
    // Call Strapi API to update the user's premium status
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          premium: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to upgrade to premium' },
        { status: response.status }
      );
    }

    const updatedUser = await response.json();
    
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error upgrading to premium:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade to premium' },
      { status: 500 }
    );
  }
} 