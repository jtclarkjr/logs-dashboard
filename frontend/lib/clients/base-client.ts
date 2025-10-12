import { buildQueryString } from '@/lib/config/utils'
import type { ApiResponse } from '@/lib/types/common'
import { ApiError, ApiErrorResponse } from './errors'
import { logError } from '@/lib/utils/error-handler'

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
            // Ensure we extract string message properly, not object
            if (typeof rawErrorData.detail === 'string') {
              errorMessage = rawErrorData.detail
            } else if (typeof rawErrorData.message === 'string') {
              errorMessage = rawErrorData.message
            } else if (typeof rawErrorData === 'string') {
              errorMessage = rawErrorData
            } else if (
              rawErrorData.detail &&
              typeof rawErrorData.detail === 'object'
            ) {
              // Handle case where detail is an object - stringify it properly
              errorMessage = JSON.stringify(rawErrorData.detail)
            } else if (
              rawErrorData.message &&
              typeof rawErrorData.message === 'object'
            ) {
              // Handle case where message is an object - stringify it properly
              errorMessage = JSON.stringify(rawErrorData.message)
            }
          }
        } catch (parseError) {
          // If we can't parse the error response, use the default message
          console.warn('Failed to parse error response:', parseError)
        }

        const apiError = new ApiError(
          errorMessage,
          response.status,
          errorData || undefined
        )

        // Conditional logging - skip logging for specific error conditions
        // Don't log 422 errors on /logs endpoint with code 0
        const shouldSkipLogging =
          response.status === 422 &&
          endpoint === '/logs' &&
          (apiError.code === 0 || !apiError.code)

        if (!shouldSkipLogging) {
          // Centralized error logging - all API errors are logged here
          logError(`API Error [${method} ${endpoint}]:`, apiError)
        }

        throw apiError
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
      // Log non-API errors (network issues, timeouts, etc.)
      logError(`Network Error [${method} ${endpoint}]:`, error)
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
