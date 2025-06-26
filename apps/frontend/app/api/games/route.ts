import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    // 1. Token Validation - Fail fast if no token
    const cookieStore = cookies();
    const userToken = cookieStore.get('userToken')?.value;
    const clientToken = cookieStore.get('clientUserToken')?.value;
    const token = userToken || clientToken;

    if (!token) {
      console.warn('[API/games] No user token found in cookies');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get limit parameter
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '10';

    console.log(`[API/games] Attempting to fetch games from Strapi (limit: ${limit})`);

    // 2. Fetch games with all related data
    let strapiResponse;
    try {
      strapiResponse = await axios.get(`${API_URL}/api/games`, {
        params: {
          'populate[0]': 'thumbnail',
          'populate[1]': 'categories',
          'populate[2]': 'questions',
          'pagination[limit]': limit
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (strapiError: any) {
      console.error('[API/games] Strapi request failed:', {
        message: strapiError.message,
        status: strapiError.response?.status,
        data: strapiError.response?.data
      });

      if (strapiError.response?.status === 401) {
        return NextResponse.json(
          { error: 'Session expired - Please log in again' },
          { status: 401 }
        );
      }

      if (strapiError.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'Unable to connect to the game server' },
          { status: 503 }
        );
      }

      throw strapiError; // Re-throw to be caught by outer catch
    }

    return NextResponse.json(strapiResponse.data);
  } catch (error: any) {
    console.error('[API/games] Unhandled error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch games',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 