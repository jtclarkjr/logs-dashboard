import { SeverityLevel } from '@/lib/enums/severity'

// Base properties that all log types share
export interface BaseLogProperties {
  timestamp: string
  severity: SeverityLevel
  source: string
  message: string
}

export interface LogEntry extends BaseLogProperties {
  id: number
  created_at: string
}

export type LogResponse = LogEntry

export interface LogListResponse {
  logs: LogResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface LogCreate extends Omit<BaseLogProperties, 'timestamp'> {
  timestamp?: string
}

export type LogUpdate = Partial<BaseLogProperties>

export interface LogCountByDate {
  date: string
  count: number
}

export interface LogCountBySeverity {
  severity: SeverityLevel
  count: number
}

export interface LogCountBySource {
  source: string
  count: number
}

export interface LogAggregationResponse {
  total_logs: number
  date_range_start: string | null
  date_range_end: string | null
  by_severity: LogCountBySeverity[]
  by_source: LogCountBySource[]
  by_date: LogCountByDate[]
}
