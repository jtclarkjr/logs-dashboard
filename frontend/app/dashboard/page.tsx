import { subDays } from 'date-fns'
import { serverApiClient } from '@/lib/clients/server-client'
import {
  LogAggregationResponse,
  ChartDataResponse,
  MetadataResponse,
  GroupBy,
  FilterAllOption,
  SeverityFilter,
  SourceFilter
} from '@/lib/types'
import { DashboardClient } from './dashboard-client'

interface DashboardPageProps {
  searchParams: Promise<{
    start_date?: string
    end_date?: string
    severity?: string
    source?: string
    group_by?: GroupBy
  }>
}

async function getInitialDashboardData(filters: {
  start_date: string
  end_date: string
  severity?: SeverityFilter
  source?: SourceFilter
  group_by?: GroupBy
}) {
  try {
    // Fetch all data in parallel
    const [aggregationResponse, chartDataResponse, metadataResponse] =
      await Promise.allSettled([
        serverApiClient.get<LogAggregationResponse>('/logs/aggregation', {
          start_date: filters.start_date,
          end_date: filters.end_date,
          ...(filters.severity &&
            filters.severity !== ('all' as FilterAllOption) && {
              severity: filters.severity
            }),
          ...(filters.source &&
            filters.source !== ('all' as FilterAllOption) && {
              source: filters.source
            })
        } as Record<string, unknown>),
        serverApiClient.get<ChartDataResponse>(
          '/logs/chart-data',
          filters as Record<string, unknown>
        ),
        serverApiClient.get<MetadataResponse>('/logs/metadata')
      ])

    return {
      aggregationData:
        aggregationResponse.status === 'fulfilled' &&
        !aggregationResponse.value.error
          ? aggregationResponse.value.data
          : undefined,
      timeSeriesData:
        chartDataResponse.status === 'fulfilled' &&
        !chartDataResponse.value.error
          ? chartDataResponse.value.data
          : undefined,
      metadata:
        metadataResponse.status === 'fulfilled' && !metadataResponse.value.error
          ? metadataResponse.value.data
          : undefined
    }
  } catch (error) {
    console.error('Failed to fetch initial dashboard data:', error)
    return {
      aggregationData: undefined,
      timeSeriesData: undefined,
      metadata: undefined
    }
  }
}

export default async function DashboardPage({
  searchParams
}: DashboardPageProps) {
  const params = await searchParams

  // Set default date range if not provided
  const defaultDateRange = {
    from: subDays(new Date(), 7),
    to: new Date()
  }

  const startDate = params.start_date || defaultDateRange.from.toISOString()
  const endDate = params.end_date || defaultDateRange.to.toISOString()

  const filters = {
    start_date: startDate,
    end_date: endDate,
    ...(params.severity && { severity: params.severity as SeverityFilter }),
    ...(params.source && { source: params.source }),
    group_by: params.group_by || ('day' as GroupBy)
  }

  // Fetch initial data on the server
  const initialData = await getInitialDashboardData(filters)

  // Parse initial filters for client component
  const initialFilters = {
    dateRange: {
      from: new Date(startDate),
      to: new Date(endDate)
    },
    selectedSeverity:
      (params.severity as SeverityFilter) || ('all' as FilterAllOption),
    selectedSource:
      (params.source as SourceFilter) || ('all' as FilterAllOption),
    timeGrouping: (params.group_by as GroupBy) || ('day' as GroupBy)
  }

  return (
    <DashboardClient
      initialData={initialData}
      initialFilters={initialFilters}
    />
  )
}
