import { NextResponse } from 'next/server'
import { serverApiClient } from '@/lib/clients/server-client'

export async function GET() {
  try {
    const response = await serverApiClient.get('/')

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('API root error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API information' },
      { status: 500 }
    )
  }
}
