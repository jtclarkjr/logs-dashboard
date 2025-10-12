import { subDays } from 'date-fns'
import type {
  GroupBy,
  FilterAllOption,
  SeverityFilter,
  SourceFilter
} from '@/lib/types/filters'
import { DashboardClient } from './dashboard-client'
import { getInitialDashboardData } from '@/lib/clients/initial/dashboard-api'

interface DashboardPageProps {
  searchParams: Promise<{
    start_date?: string
    end_date?: string
    severity?: string
    source?: string
    group_by?: GroupBy
  }>
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
