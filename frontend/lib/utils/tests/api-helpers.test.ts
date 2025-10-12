import { describe, it, expect } from 'bun:test'
import {
  extractDataFromSettledResponse,
  buildAggregationParams
} from '../api-helpers'
import { SeverityLevel } from '@/lib/enums/severity'

describe('api-helpers', () => {
  describe('extractDataFromSettledResponse', () => {
    it('should extract data from fulfilled promise with successful response', () => {
      const successfulResponse: PromiseSettledResult<{ data: { test: string }; error?: string; status: number }> = {
        status: 'fulfilled',
        value: {
          data: { test: 'success' },
          status: 200
        }
      }

      const result = extractDataFromSettledResponse(successfulResponse)
      expect(result).toEqual({ test: 'success' })
    })

    it('should return undefined for fulfilled promise with error response', () => {
      const errorResponse: PromiseSettledResult<{ data?: { test: string }; error?: string; status: number }> = {
        status: 'fulfilled',
        value: {
          error: 'API Error',
          status: 400
        }
      }

      const result = extractDataFromSettledResponse(errorResponse)
      expect(result).toBeUndefined()
    })

    it('should return undefined for rejected promise', () => {
      const rejectedResponse: PromiseSettledResult<{ data?: { test: string }; error?: string; status: number }> = {
        status: 'rejected',
        reason: new Error('Network error')
      }

      const result = extractDataFromSettledResponse(rejectedResponse)
      expect(result).toBeUndefined()
    })

    it('should return undefined for fulfilled promise with both data and error', () => {
      const ambiguousResponse: PromiseSettledResult<{ data?: { test: string }; error?: string; status: number }> = {
        status: 'fulfilled',
        value: {
          data: { test: 'data' },
          error: 'error message',
          status: 200
        }
      }

      const result = extractDataFromSettledResponse(ambiguousResponse)
      expect(result).toBeUndefined()
    })

    it('should handle fulfilled promise without data property', () => {
      const noDataResponse: PromiseSettledResult<{ data?: { test: string }; error?: string; status: number }> = {
        status: 'fulfilled',
        value: {
          status: 200
        }
      }

      const result = extractDataFromSettledResponse(noDataResponse)
      expect(result).toBeUndefined()
    })

    it('should handle different data types', () => {
      const stringResponse: PromiseSettledResult<{ data: string; error?: string; status: number }> = {
        status: 'fulfilled',
        value: {
          data: 'test string',
          status: 200
        }
      }

      const result = extractDataFromSettledResponse(stringResponse)
      expect(result).toBe('test string')
    })

    it('should handle array data', () => {
      const arrayResponse: PromiseSettledResult<{ data: number[]; error?: string; status: number }> = {
        status: 'fulfilled',
        value: {
          data: [1, 2, 3],
          status: 200
        }
      }

      const result = extractDataFromSettledResponse(arrayResponse)
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle null data', () => {
      const nullResponse: PromiseSettledResult<{ data: null; error?: string; status: number }> = {
        status: 'fulfilled',
        value: {
          data: null,
          status: 200
        }
      }

      const result = extractDataFromSettledResponse(nullResponse)
      expect(result).toBeNull()
    })
  })

  describe('buildAggregationParams', () => {
    const mockDateFilters = {
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-01-08T00:00:00Z'
    }

    it('should build params with only date filters when no severity or source provided', () => {
      const result = buildAggregationParams(mockDateFilters)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      })
    })

    it('should include severity when not "all"', () => {
      const filters = {
        ...mockDateFilters,
        severity: SeverityLevel.ERROR as const
      }

      const result = buildAggregationParams(filters)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z',
        severity: SeverityLevel.ERROR
      })
    })

    it('should exclude severity when set to "all"', () => {
      const filters = {
        ...mockDateFilters,
        severity: 'all' as const
      }

      const result = buildAggregationParams(filters)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      })
    })

    it('should include source when not "all"', () => {
      const filters = {
        ...mockDateFilters,
        source: 'web-server'
      }

      const result = buildAggregationParams(filters)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z',
        source: 'web-server'
      })
    })

    it('should exclude source when set to "all"', () => {
      const filters = {
        ...mockDateFilters,
        source: 'all' as const
      }

      const result = buildAggregationParams(filters)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      })
    })

    it('should include both severity and source when both are specified and not "all"', () => {
      const filters = {
        ...mockDateFilters,
        severity: SeverityLevel.WARNING as const,
        source: 'database'
      }

      const result = buildAggregationParams(filters)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z',
        severity: SeverityLevel.WARNING,
        source: 'database'
      })
    })

    it('should handle different severity levels', () => {
      const severityLevels = [
        SeverityLevel.DEBUG,
        SeverityLevel.INFO,
        SeverityLevel.WARNING,
        SeverityLevel.ERROR,
        SeverityLevel.CRITICAL
      ]

      severityLevels.forEach(severity => {
        const filters = {
          ...mockDateFilters,
          severity
        }

        const result = buildAggregationParams(filters)

        expect(result).toEqual({
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-01-08T00:00:00Z',
          severity
        })
      })
    })

    it('should handle various source names', () => {
      const sources = ['web-server', 'database', 'cache', 'auth-service', 'api-gateway']

      sources.forEach(source => {
        const filters = {
          ...mockDateFilters,
          source
        }

        const result = buildAggregationParams(filters)

        expect(result).toEqual({
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-01-08T00:00:00Z',
          source
        })
      })
    })

    it('should handle undefined severity and source', () => {
      const filters = {
        ...mockDateFilters,
        severity: undefined,
        source: undefined
      }

      const result = buildAggregationParams(filters)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      })
    })

    it('should handle empty string values correctly', () => {
      const filters = {
        ...mockDateFilters,
        severity: '' as never,
        source: ''
      }

      const result = buildAggregationParams(filters)

      // Empty strings are falsy, so they get filtered out by the logic
      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      })
    })

    it('should preserve original date strings', () => {
      const customDateFilters = {
        start_date: '2023-12-01T10:30:00.000Z',
        end_date: '2023-12-31T23:59:59.999Z'
      }

      const result = buildAggregationParams(customDateFilters)

      expect(result.start_date).toBe('2023-12-01T10:30:00.000Z')
      expect(result.end_date).toBe('2023-12-31T23:59:59.999Z')
    })
  })
})