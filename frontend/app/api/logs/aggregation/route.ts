import { NextRequest, NextResponse } from 'next/server'
import { serverApiClient } from '@/lib/clients/server-client'
import { LogAggregationResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      severity: searchParams.get('severity') || undefined,
      source: searchParams.get('source') || undefined
    }

    // Remove undefined values
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    )

    const response = await serverApiClient.get<LogAggregationResponse>(
      '/logs/aggregation',
      cleanedParams
    )

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Get aggregation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch aggregation data' },
      { status: 500 }
    )
  }
}
