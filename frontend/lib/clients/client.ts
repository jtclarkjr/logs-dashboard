import { BaseApiClient } from './base-client'
import { API_CONFIG } from '../config'

export class ApiClient extends BaseApiClient {
  constructor(baseUrl?: string, timeout?: number) {
    super({
      baseUrl: baseUrl || API_CONFIG.BASE_URL,
      timeout: timeout || API_CONFIG.TIMEOUT
    })
  }
}

// Client-side instance
export const apiClient = new ApiClient()
