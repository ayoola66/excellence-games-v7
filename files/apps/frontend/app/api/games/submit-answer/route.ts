import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function POST(req: NextRequest) {
  const token = (cookies().get('clientUserToken') || cookies().get('userToken'))?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()

    const strapiRes = await fetch(`${STRAPI_URL}/api/games/submit-answer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const data = await strapiRes.json()
    return NextResponse.json(data, { status: strapiRes.status })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 })
  }
} 