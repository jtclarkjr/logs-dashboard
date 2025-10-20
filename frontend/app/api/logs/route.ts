import { NextRequest, NextResponse } from 'next/server'
import { serverApiClient } from '@/lib/clients/server-client'
import type { LogListResponse, LogCreate, LogResponse } from '@/lib/types/log'
import type { LogFilters, SortOrder, SortByField } from '@/lib/types/filters'
import { ApiError } from '@/lib/clients/errors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: LogFilters = {
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!)
        : undefined,
      page_size: searchParams.get('page_size')
        ? parseInt(searchParams.get('page_size')!)
        : undefined,
      severity: searchParams.get('severity') as LogFilters['severity'],
      source: searchParams.get('source') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      search: searchParams.get('search') || undefined,
      sort_by: (searchParams.get('sort_by') as SortByField) || undefined,
      sort_order: (searchParams.get('sort_order') as SortOrder) || undefined
    }

    // Remove undefined values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined)
    )

    const response = await serverApiClient.get<LogListResponse>(
      '/logs/',
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
    // Handle ApiError with detailed error information
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: error.getDetailedMessage(),
          code: error.code,
          details: error.details,
          requestId: error.requestId
        },
        { status: error.status }
      )
    }

    // Handle generic errors
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch logs'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LogCreate = await request.json()

    const response = await serverApiClient.post<LogResponse>('/logs/', body)

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    // Handle ApiError with detailed error information
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: error.getDetailedMessage(),
          code: error.code,
          details: error.details,
          validationErrors: error.validationErrors,
          requestId: error.requestId
        },
        { status: error.status }
      )
    }

    // Handle generic errors
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create log'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
