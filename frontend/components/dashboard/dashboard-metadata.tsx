'use client'

import { format } from 'date-fns'
import { InfoIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QueryError } from '@/components/ui/error-boundary'
import type { MetadataResponse } from '@/lib/types/common'

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
        Dashboard showing data from{' '}
        {metadata?.total_logs?.toLocaleString() || 'N/A'} total logs across{' '}
        {metadata?.sources?.length || 0} sources. Data range:{' '}
        {metadata?.date_range?.earliest
          ? format(new Date(metadata.date_range.earliest), 'MMM dd, yyyy')
          : 'N/A'}{' '}
        to{' '}
        {metadata?.date_range?.latest
          ? format(new Date(metadata.date_range.latest), 'MMM dd, yyyy')
          : 'N/A'}
      </AlertDescription>
    </Alert>
  )
}
