import { buildQueryString } from '../config'
import { ApiResponse } from '../types'
import { ApiError, ApiErrorResponse } from './errors'

interface ApiClientConfig {
  baseUrl: string
  timeout: number
}

export class BaseApiClient {
  protected baseUrl: string
  protected timeout: number

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl
    this.timeout = config.timeout
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: {
      params?: Record<string, unknown>
      body?: unknown
      headers?: Record<string, string>
    } = {}
  ): Promise<ApiResponse<T>> {
    const { params = {}, body, headers = {} } = options

    try {
      const url = this.baseUrl + endpoint + buildQueryString(params)

      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: AbortSignal.timeout(this.timeout)
      }

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorData: ApiErrorResponse | null = null
        
        try {
          const rawErrorData = await response.json()
          
          // Check if it's our new standardized error format
          if (rawErrorData.error && typeof rawErrorData.error === 'object') {
            errorData = rawErrorData as ApiErrorResponse
            errorMessage = errorData.error.message || errorMessage
          } else {
            // Handle legacy error formats (FastAPI default, etc.)
            errorMessage = rawErrorData.detail || rawErrorData.message || errorMessage
          }
        } catch (parseError) {
          // If we can't parse the error response, use the default message
          console.warn('Failed to parse error response:', parseError)
        }
        
        throw new ApiError(errorMessage, response.status, errorData || undefined, response)
      }

      // Handle different response types
      const contentType = response.headers.get('content-type')
      let data: T

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text/csv')) {
        data = (await response.text()) as T
      } else {
        data = (await response.text()) as T
      }

      return {
        data,
        status: response.status
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        error: errorMessage,
        status: 0
      }
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, { params })
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, { body, params })
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, { body, params })
  }

  async delete<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, { params })
  }

  async downloadCsv(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('GET', endpoint, {
      params,
      headers: { Accept: 'text/csv' }
    })
  }
}
