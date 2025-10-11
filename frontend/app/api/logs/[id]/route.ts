import { NextRequest, NextResponse } from 'next/server'
import { serverApiClient } from '@/lib/clients/server-client'
import { LogResponse, LogUpdate } from '@/lib/types'
import { ApiError } from '@/lib/clients/errors'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const response = await serverApiClient.get<LogResponse>(`/logs/${id}`)

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Get log error:', error)
    
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch log'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body: LogUpdate = await request.json()

    const response = await serverApiClient.put<LogResponse>(`/logs/${id}`, body)

    if (response.error) {
      // Log the error for debugging
      console.error('API request failed:', {
        method: 'PUT',
        url: `/logs/${id}`,
        error: response.error,
        status: response.status
      })
      
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Update log error:', error)
    
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to update log'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const response = await serverApiClient.delete<{ message: string }>(
      `/logs/${id}`
    )

    if (response.error) {
      console.error('DELETE response error:', response.error)
      return NextResponse.json(
        { error: response.error },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Delete log error:', error)
    
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete log'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
