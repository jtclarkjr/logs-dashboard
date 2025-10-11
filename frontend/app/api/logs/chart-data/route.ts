import { NextRequest, NextResponse } from 'next/server'
import { serverApiClient } from '@/lib/clients/server-client'
import { ChartDataResponse, ChartFilters } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: ChartFilters & { group_by?: string } = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      severity: searchParams.get('severity') as ChartFilters['severity'],
      source: searchParams.get('source') || undefined,
      group_by:
        (searchParams.get('group_by') as ChartFilters['group_by']) || 'day'
    }

    // Remove undefined values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined)
    )

    const response = await serverApiClient.get<ChartDataResponse>(
      '/logs/chart-data',
      cleanedFilters
    )

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Get chart data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
