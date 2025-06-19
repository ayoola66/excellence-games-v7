import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

// Define allowed methods
const allowedMethods = ['POST'];
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export async function POST(request: Request) {
  try {
    // Check if the method is allowed
    if (!allowedMethods.includes(request.method)) {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          'Allow': allowedMethods.join(', '),
          'Content-Type': 'application/json'
        }
      });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if this email exists in the admin-user collection (not allowed for user login)
    try {
      const adminCheck = await axios.get(`${API_URL}/api/admin-user-profiles?filters[email][$eq]=${encodeURIComponent(email)}`);
      if (adminCheck.data?.data?.length > 0) {
        return NextResponse.json(
          { error: 'This email is registered as an admin. Please use the admin login.' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.warn('Admin check failed:', error);
      // Continue with login attempt even if admin check fails
    }

    // Log the request details (but not the password)
    console.log('[API/auth/login] Login attempt:', {
      email,
      apiUrl: API_URL,
      timestamp: new Date().toISOString()
    });

    // Attempt to login with Strapi
    try {
      const response = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: email,
        password,
      });

      const data = response.data;

      if (!data.jwt || !data.user) {
        console.error('[API/auth/login] Invalid response from Strapi:', data);
        return NextResponse.json(
          { error: 'Invalid response from authentication server' },
          { status: 500 }
        );
      }

      console.log('[API/auth/login] Login successful for:', email);

      // Set the JWT token in an HTTP-only cookie
      cookies().set('userToken', data.jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });

      // Set additional readable cookie for client side
      cookies().set('clientUserToken', data.jwt, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60
      });

      // Return user data without sensitive information
      return NextResponse.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          fullName: data.user.fullName || data.user.username,
          role: data.user.role?.type || 'authenticated',
          subscriptionStatus: data.user.subscriptionStatus || 'free'
        }
      });
    } catch (strapiError: any) {
      // Clear any existing token on authentication failure
      cookies().set('userToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      });
      
      cookies().set('clientUserToken', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      });

      console.error('[API/auth/login] Strapi login error:', {
        status: strapiError.response?.status,
        data: strapiError.response?.data,
        message: strapiError.message
      });

      const errorMessage = strapiError.response?.data?.error?.message || 'Authentication failed';
      const statusCode = strapiError.response?.status || 401;

      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error('[API/auth/login] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      'Allow': allowedMethods.join(', '),
      'Content-Type': 'application/json'
    }
  });
}

export async function PUT() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      'Allow': allowedMethods.join(', '),
      'Content-Type': 'application/json'
    }
  });
}

export async function DELETE() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      'Allow': allowedMethods.join(', '),
      'Content-Type': 'application/json'
    }
  });
}

export async function PATCH() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      'Allow': allowedMethods.join(', '),
      'Content-Type': 'application/json'
    }
  });
} 