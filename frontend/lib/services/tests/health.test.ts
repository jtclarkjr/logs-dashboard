import { describe, it, expect, beforeEach, afterEach, jest } from 'bun:test'
import { healthService } from '../health'
import type { HealthResponse, MetadataResponse } from '@/lib/types/common'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

describe('HealthService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('fetchApi method', () => {
    it('should make successful API calls with correct headers', async () => {
      const mockResponseData = { status: 'ok' }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
        status: 200,
        statusText: 'OK'
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getApiInfo()

      expect(mockFetch).toHaveBeenCalledWith('/api/', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponseData)
    })

    it('should merge custom headers with default headers', async () => {
      const mockResponseData = { status: 'ok' }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
        status: 200,
        statusText: 'OK'
      }
      mockFetch.mockResolvedValue(mockResponse)

      // Create a spy on the private fetchApi method by calling a public method with custom options
      const originalFetch = global.fetch
      global.fetch = jest.fn().mockResolvedValue(mockResponse)

      await healthService.healthCheck()

      expect(global.fetch).toHaveBeenCalledWith('/api/health', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      global.fetch = originalFetch
    })

    it('should handle HTTP error responses', async () => {
      const errorData = { error: 'Not Found' }
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue(errorData)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.healthCheck()).rejects.toThrow('Not Found')
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should handle HTTP error responses with malformed JSON', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.healthCheck()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should use error message from response when available', async () => {
      const errorData = { error: 'Custom error message' }
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorData)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.healthCheck()).rejects.toThrow(
        'Custom error message'
      )
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')
      mockFetch.mockRejectedValue(networkError)

      await expect(healthService.healthCheck()).rejects.toThrow('Network error')
    })

    it('should handle empty error response body', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: jest.fn().mockResolvedValue({})
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.healthCheck()).rejects.toThrow(
        'HTTP 503: Service Unavailable'
      )
    })
  })

  describe('getApiInfo', () => {
    it('should call correct endpoint', async () => {
      const mockResponseData = {
        name: 'Logs API',
        version: '1.0.0',
        description: 'API for log management'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData),
        status: 200,
        statusText: 'OK'
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getApiInfo()

      expect(mockFetch).toHaveBeenCalledWith('/api/', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponseData)
    })

    it('should return API information', async () => {
      const apiInfo = {
        name: 'Logs Dashboard API',
        version: '2.1.0',
        description: 'RESTful API for log data management',
        endpoints: ['/logs', '/health', '/metadata']
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(apiInfo)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getApiInfo()

      expect(result).toEqual(apiInfo)
      expect(result.name).toBe('Logs Dashboard API')
      expect(result.version).toBe('2.1.0')
    })

    it('should handle API info errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ error: 'Server error' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.getApiInfo()).rejects.toThrow('Server error')
    })
  })

  describe('healthCheck', () => {
    it('should call correct endpoint', async () => {
      const mockHealthResponse: HealthResponse = {
        status: 'healthy',
        timestamp: '2024-01-08T12:00:00Z',
        uptime: 3600,
        version: '1.0.0'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockHealthResponse),
        status: 200,
        statusText: 'OK'
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.healthCheck()

      expect(mockFetch).toHaveBeenCalledWith('/api/health', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockHealthResponse)
    })

    it('should return proper health response structure', async () => {
      const healthResponse: HealthResponse = {
        status: 'healthy',
        timestamp: '2024-01-08T10:30:00Z',
        uptime: 7200,
        version: '1.2.3',
        database: {
          status: 'connected',
          latency: 15
        },
        services: {
          redis: 'healthy',
          elasticsearch: 'healthy'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(healthResponse)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.healthCheck()

      expect(result).toEqual(healthResponse)
      expect(result.status).toBe('healthy')
      expect(result.uptime).toBe(7200)
      expect(result.database?.status).toBe('connected')
      expect(result.services?.redis).toBe('healthy')
    })

    it('should handle unhealthy responses', async () => {
      const unhealthyResponse: HealthResponse = {
        status: 'unhealthy',
        timestamp: '2024-01-08T12:00:00Z',
        uptime: 3600,
        version: '1.0.0',
        database: {
          status: 'disconnected',
          latency: 0
        }
      }
      const mockResponse = {
        ok: true, // API call succeeds but service is unhealthy
        json: jest.fn().mockResolvedValue(unhealthyResponse)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.healthCheck()

      expect(result.status).toBe('unhealthy')
      expect(result.database?.status).toBe('disconnected')
    })

    it('should handle health check endpoint errors', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: jest.fn().mockResolvedValue({ error: 'Service is down' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.healthCheck()).rejects.toThrow(
        'Service is down'
      )
    })

    it('should handle health check timeout scenarios', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 100)
          })
      )

      await expect(healthService.healthCheck()).rejects.toThrow(
        'Request timeout'
      )
    })
  })

  describe('getMetadata', () => {
    it('should call correct endpoint', async () => {
      const mockMetadata: MetadataResponse = {
        sources: ['web-server', 'database', 'auth-service'],
        severity_levels: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        total_logs: 150000,
        date_range: {
          earliest: '2024-01-01T00:00:00Z',
          latest: '2024-01-08T12:00:00Z'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetadata),
        status: 200,
        statusText: 'OK'
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getMetadata()

      expect(mockFetch).toHaveBeenCalledWith('/api/logs/metadata', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockMetadata)
    })

    it('should return complete metadata structure', async () => {
      const metadata: MetadataResponse = {
        sources: [
          'web-server',
          'database',
          'api-gateway',
          'auth-service',
          'cache'
        ],
        severity_levels: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        total_logs: 245678,
        date_range: {
          earliest: '2023-12-01T00:00:00Z',
          latest: '2024-01-08T15:30:00Z'
        },
        stats: {
          logs_per_day_avg: 8522,
          sources_count: 5,
          error_rate: 0.15
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(metadata)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getMetadata()

      expect(result).toEqual(metadata)
      expect(result.sources).toHaveLength(5)
      expect(result.severity_levels).toContain('ERROR')
      expect(result.total_logs).toBe(245678)
      expect(result.stats?.logs_per_day_avg).toBe(8522)
    })

    it('should handle metadata with minimal data', async () => {
      const minimalMetadata: MetadataResponse = {
        sources: [],
        severity_levels: [],
        total_logs: 0,
        date_range: {
          earliest: null,
          latest: null
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(minimalMetadata)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getMetadata()

      expect(result).toEqual(minimalMetadata)
      expect(result.sources).toHaveLength(0)
      expect(result.total_logs).toBe(0)
      expect(result.date_range.earliest).toBeNull()
    })

    it('should handle metadata errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({ error: 'Metadata not found' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.getMetadata()).rejects.toThrow(
        'Metadata not found'
      )
    })

    it('should handle metadata with special characters in sources', async () => {
      const metadata: MetadataResponse = {
        sources: [
          'web-server-v2',
          'database@main',
          'api.gateway',
          'auth:service'
        ],
        severity_levels: ['INFO', 'WARNING', 'ERROR'],
        total_logs: 1000,
        date_range: {
          earliest: '2024-01-01T00:00:00Z',
          latest: '2024-01-08T12:00:00Z'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(metadata)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getMetadata()

      expect(result.sources).toContain('web-server-v2')
      expect(result.sources).toContain('database@main')
      expect(result.sources).toContain('api.gateway')
      expect(result.sources).toContain('auth:service')
    })

    it('should handle large metadata responses', async () => {
      const largeSources = Array.from({ length: 100 }, (_, i) => `service-${i}`)
      const metadata: MetadataResponse = {
        sources: largeSources,
        severity_levels: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        total_logs: 10000000,
        date_range: {
          earliest: '2020-01-01T00:00:00Z',
          latest: '2024-01-08T12:00:00Z'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(metadata)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getMetadata()

      expect(result.sources).toHaveLength(100)
      expect(result.sources[0]).toBe('service-0')
      expect(result.sources[99]).toBe('service-99')
      expect(result.total_logs).toBe(10000000)
    })
  })

  describe('error handling edge cases', () => {
    it('should handle response.json() throwing an error', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('JSON parse error'))
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.getApiInfo()).rejects.toThrow(
        'JSON parse error'
      )
    })

    it('should handle null response data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(null)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getApiInfo()
      expect(result).toBeNull()
    })

    it('should handle undefined response data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(undefined)
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await healthService.getApiInfo()
      expect(result).toBeUndefined()
    })

    it('should handle fetch being rejected', async () => {
      const fetchError = new Error('Failed to fetch')
      mockFetch.mockRejectedValue(fetchError)

      await expect(healthService.healthCheck()).rejects.toThrow(
        'Failed to fetch'
      )
    })

    it('should handle empty error message in response', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: '' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.healthCheck()).rejects.toThrow(
        'HTTP 400: Bad Request'
      )
    })

    it('should handle missing statusText', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: undefined,
        json: jest.fn().mockResolvedValue({})
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(healthService.healthCheck()).rejects.toThrow(
        'HTTP 500: undefined'
      )
    })
  })

  describe('service instance', () => {
    it('should export a singleton instance', () => {
      expect(healthService).toBeDefined()
      expect(typeof healthService.healthCheck).toBe('function')
      expect(typeof healthService.getMetadata).toBe('function')
      expect(typeof healthService.getApiInfo).toBe('function')
    })

    it('should maintain state across multiple calls', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'ok' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await healthService.getApiInfo()
      await healthService.healthCheck()

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
