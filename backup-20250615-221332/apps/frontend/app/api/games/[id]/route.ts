import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = (cookies().get('clientUserToken') || cookies().get('userToken'))?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const strapiRes = await fetch(
    `${STRAPI_URL}/api/games/${params.id}?populate[categories][populate]=*&populate[questions][populate]=*`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    }
  )

  const data = await strapiRes.json()
  return NextResponse.json(data, { status: strapiRes.status })
} 