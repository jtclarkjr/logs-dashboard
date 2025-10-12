import type {
  LogListResponse,
  LogCreate,
  LogResponse,
  LogUpdate,
  LogAggregationResponse
} from '@/lib/types/log'
import type { ChartDataResponse } from '@/lib/types/chart'
import type {
  LogFilters,
  ChartFilters,
  ExportFilters
} from '@/lib/types/filters'

const API_BASE = '/api'

class LogsService {
  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    // Handle CSV responses
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('text/csv')) {
      return response.blob() as T
    }

    return response.json()
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  async getLogs(filters?: LogFilters): Promise<LogListResponse> {
    const queryString = filters
      ? this.buildQueryString(filters as Record<string, unknown>)
      : ''
    return this.fetchApi<LogListResponse>(`/logs${queryString}`)
  }

  async getLog(id: number): Promise<LogResponse> {
    return this.fetchApi<LogResponse>(`/logs/${id}`)
  }

  async createLog(logData: LogCreate): Promise<LogResponse> {
    return this.fetchApi<LogResponse>('/logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    })
  }

  async updateLog(id: number, logData: LogUpdate): Promise<LogResponse> {
    return this.fetchApi<LogResponse>(`/logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(logData)
    })
  }

  async deleteLog(id: number): Promise<{ message: string }> {
    return this.fetchApi<{ message: string }>(`/logs/${id}`, {
      method: 'DELETE'
    })
  }

  async getLogAggregation(filters?: {
    start_date?: string
    end_date?: string
    severity?: string
    source?: string
  }): Promise<LogAggregationResponse> {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.fetchApi<LogAggregationResponse>(
      `/logs/aggregation${queryString}`
    )
  }

  async getChartData(filters?: ChartFilters): Promise<ChartDataResponse> {
    const queryString = filters
      ? this.buildQueryString(filters as Record<string, unknown>)
      : ''
    return this.fetchApi<ChartDataResponse>(`/logs/chart-data${queryString}`)
  }

  async exportLogs(filters?: ExportFilters): Promise<Blob> {
    const queryString = filters
      ? this.buildQueryString(filters as Record<string, unknown>)
      : ''
    return this.fetchApi<Blob>(`/logs/export/csv${queryString}`)
  }

  // Convenience method for downloading CSV
  async downloadLogsAsCsv(
    filters?: ExportFilters,
    filename = 'logs_export.csv'
  ): Promise<void> {
    try {
      const blob = await this.exportLogs(filters)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download CSV:', error)
      throw error
    }
  }
}

export const logsService = new LogsService()
