import { SeverityLevel } from '@/lib/enums/severity'

export type SortOrder = 'asc' | 'desc'
export type GroupBy = 'hour' | 'day' | 'week' | 'month'
export type FilterAllOption = 'all'
export type SeverityFilter = SeverityLevel | FilterAllOption
export type SourceFilter = string // Dynamic sources from API
export type SortByField = 'timestamp' | 'severity' | 'source'

export interface LogFilters {
  page?: number
  page_size?: number
  severity?: SeverityLevel
  source?: string
  start_date?: string
  end_date?: string
  search?: string
  sort_by?: SortByField
  sort_order?: SortOrder
}

export interface ChartFilters {
  start_date?: string
  end_date?: string
  severity?: SeverityLevel
  source?: string
  group_by?: GroupBy
}

export interface ExportFilters {
  severity?: SeverityLevel
  source?: string
  start_date?: string
  end_date?: string
}

export interface LogAggregationFilters {
  start_date?: string
  end_date?: string
  severity?: string
  source?: string
}

export interface DateFilters {
  start_date: string
  end_date: string
}
