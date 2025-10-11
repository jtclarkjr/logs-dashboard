export interface LogEntry {
  id: number
  timestamp: string
  severity: SeverityLevel
  source: string
  message: string
  created_at: string
}

export interface LogResponse {
  id: number
  timestamp: string
  severity: SeverityLevel
  source: string
  message: string
  created_at: string
}

export interface LogListResponse {
  logs: LogResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface LogCreate {
  timestamp?: string
  severity: SeverityLevel
  source: string
  message: string
}

export interface LogUpdate {
  timestamp?: string
  severity?: SeverityLevel
  source?: string
  message?: string
}

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

export enum SeverityLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}
