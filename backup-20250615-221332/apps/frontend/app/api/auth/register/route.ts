import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, address } = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email.split('@')[0],
        email,
        password,
        fullName,
        phone,
        address,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.error?.message || 'Registration failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 