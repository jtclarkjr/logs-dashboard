import { HealthResponse, MetadataResponse } from '../types'

const API_BASE = '/api'

class HealthService {
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

    return response.json()
  }

  async getApiInfo() {
    return this.fetchApi('/')
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.fetchApi<HealthResponse>('/health')
  }

  async getMetadata(): Promise<MetadataResponse> {
    return this.fetchApi<MetadataResponse>('/logs/metadata')
  }
}

export const healthService = new HealthService()
