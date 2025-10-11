import { NextResponse } from 'next/server'
import { serverApiClient } from '@/lib/clients/server-client'
import { HealthResponse } from '@/lib/types'

export async function GET() {
  try {
    const response = await serverApiClient.get<HealthResponse>('/health')

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { error: 'Failed to perform health check' },
      { status: 500 }
    )
  }
}
