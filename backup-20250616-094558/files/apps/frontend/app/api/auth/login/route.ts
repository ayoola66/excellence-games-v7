import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '@/lib/api';

// Define allowed methods
const allowedMethods = ['POST'];

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
      const adminCheck = await api.get(`/admin-user-profiles?filters[email][$eq]=${encodeURIComponent(email)}`);
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
    console.log('Login attempt:', {
      email,
      apiUrl: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337',
      timestamp: new Date().toISOString()
    });

    // Attempt to login with Strapi
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Clear any existing token on authentication failure
      cookies().set('userToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      });

      console.error('Login error:', {
        status: response.status,
        error: data.error?.message || 'Authentication failed'
      });

      return NextResponse.json(
        { error: data.error?.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    if (!data.jwt || !data.user) {
      return NextResponse.json(
        { error: 'Invalid response from authentication server' },
        { status: 500 }
      );
    }

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
  } catch (error: any) {
    console.error('User login error:', error);
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