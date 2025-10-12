import { NextRequest, NextResponse } from 'next/server'
import { serverApiClient } from '@/lib/clients/server-client'
import type { ExportFilters } from '@/lib/types/filters'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: ExportFilters = {
      severity: searchParams.get('severity') as ExportFilters['severity'],
      source: searchParams.get('source') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined
    }

    // Remove undefined values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined)
    )

    const response = await serverApiClient.downloadCsv(
      '/logs/export/csv',
      cleanedFilters
    )

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    // Return CSV file response
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=logs_export.csv'
      }
    })
  } catch (error) {
    console.error('Export CSV error:', error)
    return NextResponse.json(
      { error: 'Failed to export logs as CSV' },
      { status: 500 }
    )
  }
}
