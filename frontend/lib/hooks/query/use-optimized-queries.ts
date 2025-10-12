import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { logsService } from '@/lib/services/logs'
import { healthService } from '@/lib/services/health'
import type {
  LogFilters,
  GroupBy,
  FilterAllOption,
  SeverityFilter,
  SourceFilter,
  SortOrder,
  SortByField
} from '@/lib/types/filters'
import { DateRange } from 'react-day-picker'
import {
  createAggregationFilters,
  createChartFilters
} from '@/lib/utils/filter-helpers'

/**
 * Optimized hook for dashboard data that combines filters and data transformation
 * Uses React Query's built-in memoization
 */
export function useDashboardData({
  dateRange,
  selectedSeverity,
  selectedSource,
  timeGrouping
}: {
  dateRange?: DateRange
  selectedSeverity: SeverityFilter
  selectedSource: SourceFilter
  timeGrouping: GroupBy
}) {
  const aggregationFilters = createAggregationFilters(
    dateRange,
    selectedSeverity,
    selectedSource
  )

  const chartFilters = createChartFilters(
    dateRange,
    selectedSeverity,
    selectedSource,
    timeGrouping
  )

  // Aggregation data query
  const aggregationQuery = useQuery({
    queryKey: ['log-aggregation', aggregationFilters],
    queryFn: () => logsService.getLogAggregation(aggregationFilters!),
    enabled: Boolean(aggregationFilters)
  })

  // Chart data query with transformation
  const chartQuery = useQuery({
    queryKey: ['chart-data', chartFilters],
    queryFn: () => logsService.getChartData(chartFilters!),
    enabled: Boolean(chartFilters),
    select: (data) => {
      if (!data?.data) return []

      return data.data.map((item) => ({
        ...item,
        date: format(
          new Date(item.timestamp),
          timeGrouping === ('hour' as GroupBy) ? 'MMM dd HH:mm' : 'MMM dd'
        )
      }))
    }
  })

  // Metadata query
  const metadataQuery = useQuery({
    queryKey: ['metadata'],
    queryFn: () => healthService.getMetadata(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  return {
    // Aggregation data
    aggregationData: aggregationQuery.data,
    isLoadingAggregation: aggregationQuery.isLoading,
    aggregationError: aggregationQuery.error,

    // Chart data (pre-formatted)
    timeSeriesData: chartQuery.data || [],
    isLoadingChart: chartQuery.isLoading,
    chartError: chartQuery.error,

    // Metadata
    metadata: metadataQuery.data,
    isLoadingMetadata: metadataQuery.isLoading,
    metadataError: metadataQuery.error,

    // Combined loading state
    isLoading:
      aggregationQuery.isLoading ||
      chartQuery.isLoading ||
      metadataQuery.isLoading
  }
}

/**
 * Optimized hook for logs list with automatic filter memoization
 */
export function useOptimizedLogs({
  currentPage,
  pageSize,
  searchQuery,
  selectedSeverity,
  selectedSource,
  sortBy,
  sortOrder,
  dateRange
}: {
  currentPage: number
  pageSize: number
  searchQuery: string
  selectedSeverity: SeverityFilter
  selectedSource: SourceFilter
  sortBy: SortByField
  sortOrder: SortOrder
  dateRange?: DateRange
}) {
  return useQuery({
    queryKey: [
      'logs',
      {
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedSeverity !== ('all' as FilterAllOption) && {
          severity: selectedSeverity
        }),
        ...(selectedSource !== ('all' as FilterAllOption) && {
          source: selectedSource
        }),
        ...(dateRange?.from && { start_date: dateRange.from.toISOString() }),
        ...(dateRange?.to && { end_date: dateRange.to.toISOString() })
      } as LogFilters
    ],
    queryFn: ({ queryKey }) => {
      const filters = queryKey[1] as LogFilters
      return logsService.getLogs(filters)
    }
  })
}
