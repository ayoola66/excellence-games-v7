import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simple endpoint returning the current user JWT to the client.
// The token itself is still stored only in http-only cookies; this route merely
// surfaces it on demand so that client-side code (e.g. if running inside an
// <iframe>) can attach it to API requests without relying on localStorage.
//
// IMPORTANT: the response cache is disabled to ensure the latest token is
// returned, and we never store the token anywhere else on the client.

export async function GET () {
  const tokenCookie = cookies().get('clientUserToken') || cookies().get('userToken')

  if (!tokenCookie?.value) {
    return NextResponse.json({ authToken: null }, { status: 200 })
  }

  return NextResponse.json({ authToken: tokenCookie.value }, { status: 200 })
} 