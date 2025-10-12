import { SeverityLevel } from '@/lib/enums/severity'
import type {
  LogFilters,
  SortOrder,
  SortByField,
  FilterAllOption,
  SeverityFilter,
  SourceFilter
} from '@/lib/types/filters'
import { LogsClient } from './logs-client'
import { getInitialLogs } from '@/lib/clients/initial/logs-api'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination'

interface LogsPageProps {
  searchParams: Promise<{
    page?: string
    page_size?: string
    search?: string
    severity?: string
    source?: string
    sort_by?: string
    sort_order?: SortOrder
    start_date?: string
    end_date?: string
  }>
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const params = await searchParams

  // Parse URL parameters
  const filters: LogFilters = {
    page: params.page ? parseInt(params.page) : 1,
    page_size: params.page_size
      ? parseInt(params.page_size)
      : DEFAULT_PAGE_SIZE,
    sort_by: (params.sort_by as SortByField) || ('timestamp' as SortByField),
    sort_order: params.sort_order || ('desc' as SortOrder),
    ...(params.search && { search: params.search }),
    ...(params.severity &&
      params.severity !== ('all' as FilterAllOption) && {
        severity: params.severity as SeverityLevel
      }),
    ...(params.source &&
      params.source !== ('all' as FilterAllOption) && {
        source: params.source
      }),
    ...(params.start_date && { start_date: params.start_date }),
    ...(params.end_date && { end_date: params.end_date })
  }

  // Fetch initial data on the server
  const initialData = await getInitialLogs(filters)

  // Parse initial filters for client component
  const initialFilters = {
    searchQuery: params.search || '',
    selectedSeverity:
      (params.severity as SeverityFilter) || ('all' as FilterAllOption),
    selectedSource:
      (params.source as SourceFilter) || ('all' as FilterAllOption),
    sortBy: (params.sort_by as SortByField) || ('timestamp' as SortByField),
    sortOrder: params.sort_order || ('desc' as SortOrder),
    currentPage: filters.page || 1,
    dateRange:
      params.start_date && params.end_date
        ? {
            from: new Date(params.start_date),
            to: new Date(params.end_date)
          }
        : undefined
  }

  return (
    <LogsClient initialData={initialData} initialFilters={initialFilters} />
  )
}
