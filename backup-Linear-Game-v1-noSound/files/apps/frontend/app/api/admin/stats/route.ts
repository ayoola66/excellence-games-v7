import { NextResponse } from 'next/server'
import { api } from '@/lib/api'

export async function GET(request: Request) {
  try {
    const response = await api.get('/admin/stats')
    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('Failed to fetch admin stats:', error)
    const status = error.response?.status || 500
    const message = error.response?.data?.error?.message || 'Internal server error'
    return NextResponse.json({ error: message }, { status })
  }
} 