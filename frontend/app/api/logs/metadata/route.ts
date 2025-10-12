import { NextResponse } from 'next/server'
import { serverApiClient } from '@/lib/clients/server-client'
import type { MetadataResponse } from '@/lib/types/common'

export async function GET() {
  try {
    const response =
      await serverApiClient.get<MetadataResponse>('/logs/metadata')

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Get metadata error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}
