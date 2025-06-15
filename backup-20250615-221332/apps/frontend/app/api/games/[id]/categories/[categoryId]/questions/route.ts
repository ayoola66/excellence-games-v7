import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  const token = (cookies().get('clientUserToken') || cookies().get('userToken'))?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const excludeIds = searchParams.get('excludeIds')?.split(',') || []

  let url = `${STRAPI_URL}/api/questions?filters[category][id][$eq]=${params.categoryId}&filters[game][id][$eq]=${params.id}&populate=*`
  if (excludeIds.length) {
    url += `&filters[id][$notIn]=${excludeIds.join(',')}`
  }

  const strapiRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })

  const data = await strapiRes.json()
  return NextResponse.json(data, { status: strapiRes.status })
}