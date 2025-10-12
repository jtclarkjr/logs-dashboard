import { BaseApiClient } from './base-client'
import { API_CONFIG } from '@/lib/config/constants'

export class ServerApiClient extends BaseApiClient {
  constructor(baseUrl?: string, timeout?: number) {
    super({
      baseUrl: baseUrl || API_CONFIG.SERVER_BASE_URL,
      timeout: timeout || API_CONFIG.TIMEOUT
    })
  }
}

// Server-side instance
export const serverApiClient = new ServerApiClient()
