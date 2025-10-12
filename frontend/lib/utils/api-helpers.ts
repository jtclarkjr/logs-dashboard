import type {
  SeverityFilter,
  SourceFilter,
  FilterAllOption
} from '@/lib/types/filters'

/**
 * Extract data from settled promises
 * Handles the common pattern of checking if a promise fulfilled successfully
 * and extracting data from API responses
 */
export const extractDataFromSettledResponse = <T>(
  response: PromiseSettledResult<{ data?: T; error?: string; status: number }>
): T | undefined => {
  return response.status === 'fulfilled' && !response.value.error
    ? response.value.data
    : undefined
}

/**
 * Build aggregation API parameters
 * Filters out 'all' values and builds clean parameter object for API calls
 */
export const buildAggregationParams = (filters: {
  start_date: string
  end_date: string
  severity?: SeverityFilter
  source?: SourceFilter
}): Record<string, unknown> => {
  const params: Record<string, unknown> = {
    start_date: filters.start_date,
    end_date: filters.end_date
  }

  if (filters.severity && filters.severity !== ('all' as FilterAllOption)) {
    params.severity = filters.severity
  }

  if (filters.source && filters.source !== ('all' as FilterAllOption)) {
    params.source = filters.source
  }

  return params
}
