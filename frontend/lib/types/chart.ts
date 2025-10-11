export interface ChartDataPoint {
  timestamp: string
  total: number
  DEBUG: number
  INFO: number
  WARNING: number
  ERROR: number
  CRITICAL: number
}

export interface ChartDataResponse {
  data: ChartDataPoint[]
  group_by: string
  start_date: string | null
  end_date: string | null
  filters: {
    severity: string | null
    source: string | null
  }
}
