export interface HealthResponse {
  status: string
  message: string
  version: string
}

export interface MetadataResponse {
  severity_levels: string[]
  sources: string[]
  date_range: {
    earliest: string | null
    latest: string | null
  }
  severity_stats: Record<string, number>
  total_logs: number
  sort_fields: string[]
  pagination: {
    default_page_size: number
    max_page_size: number
  }
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}
