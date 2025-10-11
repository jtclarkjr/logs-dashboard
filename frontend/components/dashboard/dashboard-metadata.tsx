'use client'

import { format } from 'date-fns'
import { InfoIcon } from 'lucide-react'
import { Alert, AlertDescription, QueryError } from '@/components/ui'
import { MetadataResponse } from '@/lib/types'

interface DashboardMetadataProps {
  metadata?: MetadataResponse
  isLoading: boolean
  error?: Error | null
}

export function DashboardMetadata({
  metadata,
  isLoading,
  error
}: DashboardMetadataProps) {
  if (error) {
    return <QueryError error={error} title="Failed to load metadata" />
  }

  if (!metadata || isLoading) {
    return null
  }

  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        Dashboard showing data from {metadata.total_logs.toLocaleString()} total
        logs across {metadata.sources.length} sources. Data range:{' '}
        {metadata.date_range.earliest
          ? format(new Date(metadata.date_range.earliest), 'MMM dd, yyyy')
          : 'N/A'}{' '}
        to{' '}
        {metadata.date_range.latest
          ? format(new Date(metadata.date_range.latest), 'MMM dd, yyyy')
          : 'N/A'}
      </AlertDescription>
    </Alert>
  )
}
