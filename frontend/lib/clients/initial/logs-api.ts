import { serverApiClient } from '@/lib/clients/server-client'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination'
import type { LogFilters } from '@/lib/types/filters'
import type { LogListResponse } from '@/lib/types/log'

/**
 * Fetches initial logs data with proper error handling
 * Returns empty data structure on error to prevent page crashes
 */
export const getInitialLogs = async (
  filters: LogFilters
): Promise<LogListResponse> => {
  try {
    const response = await serverApiClient.get<LogListResponse>(
      '/logs',
      filters as Record<string, unknown>
    )

    if (response.error) {
      throw new Error(response.error)
    }

    return response.data!
  } catch {
    // Error is already logged in base-client, just return empty data structure
    return {
      logs: [],
      total: 0,
      page: 1,
      page_size: DEFAULT_PAGE_SIZE,
      total_pages: 0
    }
  }
}
