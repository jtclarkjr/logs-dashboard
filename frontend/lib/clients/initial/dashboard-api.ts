import { serverApiClient } from '@/lib/clients/server-client'
import type { LogAggregationResponse } from '@/lib/types/log'
import type { ChartDataResponse } from '@/lib/types/chart'
import type { MetadataResponse } from '@/lib/types/common'
import type { SeverityFilter, SourceFilter, GroupBy } from '@/lib/types/filters'
import {
  extractDataFromSettledResponse,
  buildAggregationParams
} from '@/lib/utils/api-helpers'

export interface DashboardFilters {
  start_date: string
  end_date: string
  severity?: SeverityFilter
  source?: SourceFilter
  group_by?: GroupBy
}

export interface DashboardData {
  aggregationData: LogAggregationResponse | undefined
  timeSeriesData: ChartDataResponse | undefined
  metadata: MetadataResponse | undefined
}

/**
 * Fetches initial dashboard data including aggregation, time series, and metadata
 * Returns undefined for any failed requests while allowing others to succeed
 */
export const getInitialDashboardData = async (
  filters: DashboardFilters
): Promise<DashboardData> => {
  try {
    const [aggregationResponse, chartDataResponse, metadataResponse] =
      await Promise.allSettled([
        serverApiClient.get<LogAggregationResponse>(
          '/logs/aggregation',
          buildAggregationParams(filters)
        ),
        serverApiClient.get<ChartDataResponse>(
          '/logs/chart-data',
          filters as unknown as Record<string, unknown>
        ),
        serverApiClient.get<MetadataResponse>('/logs/metadata')
      ])

    return {
      aggregationData: extractDataFromSettledResponse(aggregationResponse),
      timeSeriesData: extractDataFromSettledResponse(chartDataResponse),
      metadata: extractDataFromSettledResponse(metadataResponse)
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
