import { BaseApiClient } from './base-client'
import { API_CONFIG } from '@/lib/config/constants'

export class ApiClient extends BaseApiClient {
  constructor(baseUrl?: string, timeout?: number) {
    super({
      baseUrl: baseUrl || API_CONFIG.BASE_URL || 'http://localhost:8000',
      timeout: timeout || API_CONFIG.TIMEOUT
    })
  }
}

// Client-side instance
export const apiClient = new ApiClient()
