import { describe, it, expect, beforeEach, afterEach, jest, spyOn } from 'bun:test'
import { logsService } from '../logs'
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
import { SeverityLevel } from '@/lib/enums/severity'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch as any

// Mock DOM methods for download functionality
const mockCreateElement = jest.fn()
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()
const mockClick = jest.fn()
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()

// Mock console.error for error handling tests
const mockConsoleError = jest.fn()
const originalConsoleError = console.error

// Store original DOM methods
const originalCreateElement = document.createElement
const originalAppendChild = document.body.appendChild
const originalRemoveChild = document.body.removeChild
const originalCreateObjectURL = window.URL.createObjectURL
const originalRevokeObjectURL = window.URL.revokeObjectURL

describe('LogsService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockCreateElement.mockClear()
    mockAppendChild.mockClear()
    mockRemoveChild.mockClear()
    mockClick.mockClear()
    mockCreateObjectURL.mockClear()
    mockRevokeObjectURL.mockClear()
    mockConsoleError.mockClear()

    // Mock document methods
    document.createElement = mockCreateElement
    document.body.appendChild = mockAppendChild
    document.body.removeChild = mockRemoveChild

    // Mock window.URL methods
    window.URL.createObjectURL = mockCreateObjectURL
    window.URL.revokeObjectURL = mockRevokeObjectURL

    // Mock console.error
    console.error = mockConsoleError

    // Setup default mocks for DOM elements
    const mockLinkElement = {
      href: '',
      download: '',
      click: mockClick
    }
    mockCreateElement.mockReturnValue(mockLinkElement)
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
  })

  afterEach(() => {
    jest.restoreAllMocks()
    console.error = originalConsoleError
    
    // Restore original DOM methods
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
    window.URL.createObjectURL = originalCreateObjectURL
    window.URL.revokeObjectURL = originalRevokeObjectURL
  })

  describe('fetchApi method', () => {
    it('should make successful API calls with correct headers', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLogs()

      expect(mockFetch).toHaveBeenCalledWith('/api/logs', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual({ data: 'test' })
    })

    it('should handle CSV responses correctly', async () => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
        headers: { get: jest.fn().mockReturnValue('text/csv') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.exportLogs()

      expect(mockResponse.blob).toHaveBeenCalled()
      expect(result).toEqual(mockBlob)
    })

    it('should handle HTTP error responses', async () => {
      const errorData = { error: 'Bad Request' }
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(errorData)
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.getLogs()).rejects.toThrow('Bad Request')
    })

    it('should handle malformed JSON in error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.getLogs()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      )
    })
  })

  describe('buildQueryString method', () => {
    it('should build query string from parameters', async () => {
      const filters: LogFilters = {
        page: 1,
        page_size: 20,
        search: 'error',
        severity: SeverityLevel.ERROR,
        source: 'web-server'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ logs: [], total: 0 }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      await logsService.getLogs(filters)

      const expectedUrl = '/api/logs?page=1&page_size=20&search=error&severity=ERROR&source=web-server'
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
    })

    it('should handle empty parameters', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ logs: [] }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      await logsService.getLogs()

      expect(mockFetch).toHaveBeenCalledWith('/api/logs', expect.any(Object))
    })

    it('should filter out undefined, null, and empty values', async () => {
      const filters = {
        page: 1,
        search: '',
        severity: undefined,
        source: null
      } as any
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ logs: [] }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      await logsService.getLogs(filters)

      expect(mockFetch).toHaveBeenCalledWith('/api/logs?page=1', expect.any(Object))
    })

    it('should handle special characters in parameters', async () => {
      const filters: LogFilters = {
        search: 'error message with spaces & symbols',
        source: 'service@domain.com'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ logs: [] }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      await logsService.getLogs(filters)

      const call = mockFetch.mock.calls[0][0]
      expect(call).toContain('search=error+message+with+spaces+%26+symbols')
      expect(call).toContain('source=service%40domain.com')
    })
  })

  describe('getLogs', () => {
    it('should fetch logs without filters', async () => {
      const mockLogList: LogListResponse = {
        logs: [
          {
            id: 1,
            message: 'Test log',
            severity: SeverityLevel.INFO,
            source: 'test-service',
            timestamp: '2024-01-08T12:00:00Z',
            created_at: '2024-01-08T12:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockLogList),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLogs()

      expect(mockFetch).toHaveBeenCalledWith('/api/logs', expect.any(Object))
      expect(result).toEqual(mockLogList)
    })

    it('should fetch logs with all filters', async () => {
      const filters: LogFilters = {
        page: 2,
        page_size: 50,
        search: 'database error',
        severity: SeverityLevel.ERROR,
        source: 'database',
        sort_by: 'timestamp',
        sort_order: 'desc',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      }
      const mockLogList: LogListResponse = {
        logs: [],
        total: 100,
        page: 2,
        page_size: 50,
        total_pages: 2
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockLogList),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLogs(filters)

      const expectedUrl = '/api/logs?page=2&page_size=50&search=database+error&severity=ERROR&source=database&sort_by=timestamp&sort_order=desc&start_date=2024-01-01T00%3A00%3A00Z&end_date=2024-01-08T00%3A00%3A00Z'
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual(mockLogList)
    })

    it('should handle large log lists', async () => {
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        message: `Log message ${i + 1}`,
        severity: SeverityLevel.INFO,
        source: 'test-service',
        timestamp: '2024-01-08T12:00:00Z',
        created_at: '2024-01-08T12:00:00Z'
      }))
      const mockLogList: LogListResponse = {
        logs: largeLogs,
        total: 1000,
        page: 1,
        page_size: 1000,
        total_pages: 1
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockLogList),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLogs()

      expect(result.logs).toHaveLength(1000)
      expect(result.total).toBe(1000)
    })
  })

  describe('getLog', () => {
    it('should fetch single log by id', async () => {
      const mockLog: LogResponse = {
        id: 123,
        message: 'Single log message',
        severity: SeverityLevel.WARNING,
        source: 'api-service',
        timestamp: '2024-01-08T12:00:00Z',
        created_at: '2024-01-08T12:00:00Z',
        metadata: { user_id: '456', request_id: 'req-789' }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockLog),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLog(123)

      expect(mockFetch).toHaveBeenCalledWith('/api/logs/123', expect.any(Object))
      expect(result).toEqual(mockLog)
    })

    it('should handle log not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({ error: 'Log not found' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.getLog(999)).rejects.toThrow('Log not found')
    })

    it('should handle different log id types', async () => {
      const mockLog: LogResponse = {
        id: 1,
        message: 'Test log',
        severity: SeverityLevel.INFO,
        source: 'test',
        timestamp: '2024-01-08T12:00:00Z',
        created_at: '2024-01-08T12:00:00Z'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockLog),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      await logsService.getLog(1)
      expect(mockFetch).toHaveBeenCalledWith('/api/logs/1', expect.any(Object))

      await logsService.getLog(0)
      expect(mockFetch).toHaveBeenCalledWith('/api/logs/0', expect.any(Object))
    })
  })

  describe('createLog', () => {
    it('should create a new log', async () => {
      const logData: LogCreate = {
        message: 'New log entry',
        severity: SeverityLevel.INFO,
        source: 'test-service',
        timestamp: '2024-01-08T12:00:00Z'
      }
      const mockCreatedLog: LogResponse = {
        id: 456,
        ...logData,
        created_at: '2024-01-08T12:00:00Z'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCreatedLog),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.createLog(logData)

      expect(mockFetch).toHaveBeenCalledWith('/api/logs', {
        method: 'POST',
        body: JSON.stringify(logData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockCreatedLog)
    })

    it('should create log with metadata', async () => {
      const logData: LogCreate = {
        message: 'Log with metadata',
        severity: SeverityLevel.ERROR,
        source: 'auth-service',
        timestamp: '2024-01-08T12:00:00Z',
        metadata: {
          user_id: '123',
          action: 'login_attempt',
          ip_address: '192.168.1.100'
        }
      }
      const mockCreatedLog: LogResponse = {
        id: 789,
        ...logData,
        created_at: '2024-01-08T12:00:00Z'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCreatedLog),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.createLog(logData)

      expect(result.metadata).toEqual(logData.metadata)
      expect(result.id).toBe(789)
    })

    it('should handle create log validation errors', async () => {
      const invalidLogData = {
        message: '', // Invalid empty message
        severity: 'INVALID' as any,
        source: 'test'
      }
      const mockResponse = {
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: jest.fn().mockResolvedValue({
          error: 'Validation failed: message cannot be empty'
        })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.createLog(invalidLogData)).rejects.toThrow(
        'Validation failed: message cannot be empty'
      )
    })
  })

  describe('updateLog', () => {
    it('should update an existing log', async () => {
      const logUpdate: LogUpdate = {
        message: 'Updated log message',
        severity: SeverityLevel.WARNING
      }
      const mockUpdatedLog: LogResponse = {
        id: 123,
        message: 'Updated log message',
        severity: SeverityLevel.WARNING,
        source: 'test-service',
        timestamp: '2024-01-08T12:00:00Z',
        created_at: '2024-01-08T12:00:00Z'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockUpdatedLog),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.updateLog(123, logUpdate)

      expect(mockFetch).toHaveBeenCalledWith('/api/logs/123', {
        method: 'PUT',
        body: JSON.stringify(logUpdate),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockUpdatedLog)
    })

    it('should handle partial updates', async () => {
      const logUpdate: LogUpdate = {
        severity: SeverityLevel.CRITICAL
      }
      const mockUpdatedLog: LogResponse = {
        id: 456,
        message: 'Original message',
        severity: SeverityLevel.CRITICAL,
        source: 'database',
        timestamp: '2024-01-08T12:00:00Z',
        created_at: '2024-01-08T12:00:00Z'
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockUpdatedLog),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.updateLog(456, logUpdate)

      expect(result.severity).toBe(SeverityLevel.CRITICAL)
      expect(result.message).toBe('Original message')
    })

    it('should handle update log not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({ error: 'Log not found for update' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.updateLog(999, { message: 'test' })).rejects.toThrow(
        'Log not found for update'
      )
    })
  })

  describe('deleteLog', () => {
    it('should delete a log', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Log deleted successfully' }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.deleteLog(123)

      expect(mockFetch).toHaveBeenCalledWith('/api/logs/123', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual({ message: 'Log deleted successfully' })
    })

    it('should handle delete log not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({ error: 'Log not found for deletion' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.deleteLog(999)).rejects.toThrow(
        'Log not found for deletion'
      )
    })

    it('should handle delete permission errors', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue({ error: 'Insufficient permissions' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.deleteLog(123)).rejects.toThrow('Insufficient permissions')
    })
  })

  describe('getLogAggregation', () => {
    it('should fetch log aggregation without filters', async () => {
      const mockAggregation: LogAggregationResponse = {
        total_logs: 10000,
        severity_counts: {
          DEBUG: 2000,
          INFO: 5000,
          WARNING: 2000,
          ERROR: 800,
          CRITICAL: 200
        },
        source_counts: {
          'web-server': 4000,
          'database': 3000,
          'auth-service': 2000,
          'api-gateway': 1000
        },
        time_range: {
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-01-08T00:00:00Z'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAggregation),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLogAggregation()

      expect(mockFetch).toHaveBeenCalledWith('/api/logs/aggregation', expect.any(Object))
      expect(result).toEqual(mockAggregation)
    })

    it('should fetch log aggregation with filters', async () => {
      const filters = {
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-07T00:00:00Z',
        severity: 'ERROR',
        source: 'database'
      }
      const mockAggregation: LogAggregationResponse = {
        total_logs: 500,
        severity_counts: { ERROR: 500 },
        source_counts: { database: 500 },
        time_range: filters
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAggregation),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLogAggregation(filters)

      const expectedUrl = '/api/logs/aggregation?start_date=2024-01-01T00%3A00%3A00Z&end_date=2024-01-07T00%3A00%3A00Z&severity=ERROR&source=database'
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual(mockAggregation)
    })

    it('should handle empty aggregation results', async () => {
      const mockAggregation: LogAggregationResponse = {
        total_logs: 0,
        severity_counts: {},
        source_counts: {},
        time_range: {
          start_date: '2024-01-08T00:00:00Z',
          end_date: '2024-01-08T23:59:59Z'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAggregation),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLogAggregation()

      expect(result.total_logs).toBe(0)
      expect(Object.keys(result.severity_counts)).toHaveLength(0)
      expect(Object.keys(result.source_counts)).toHaveLength(0)
    })
  })

  describe('getChartData', () => {
    it('should fetch chart data without filters', async () => {
      const mockChartData: ChartDataResponse = {
        time_series: [
          {
            timestamp: '2024-01-08T00:00:00Z',
            count: 150,
            severity_breakdown: {
              INFO: 100,
              WARNING: 30,
              ERROR: 20
            }
          },
          {
            timestamp: '2024-01-08T01:00:00Z',
            count: 200,
            severity_breakdown: {
              INFO: 150,
              WARNING: 35,
              ERROR: 15
            }
          }
        ],
        summary: {
          total_count: 350,
          time_range: {
            start: '2024-01-08T00:00:00Z',
            end: '2024-01-08T02:00:00Z'
          },
          group_by: 'hour'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockChartData),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getChartData()

      expect(mockFetch).toHaveBeenCalledWith('/api/logs/chart-data', expect.any(Object))
      expect(result).toEqual(mockChartData)
    })

    it('should fetch chart data with filters', async () => {
      const filters: ChartFilters = {
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z',
        severity: SeverityLevel.ERROR,
        source: 'web-server',
        group_by: 'day'
      }
      const mockChartData: ChartDataResponse = {
        time_series: [
          {
            timestamp: '2024-01-01T00:00:00Z',
            count: 50,
            severity_breakdown: { ERROR: 50 }
          }
        ],
        summary: {
          total_count: 50,
          time_range: {
            start: filters.start_date,
            end: filters.end_date
          },
          group_by: 'day'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockChartData),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getChartData(filters)

      const expectedUrl = '/api/logs/chart-data?start_date=2024-01-01T00%3A00%3A00Z&end_date=2024-01-08T00%3A00%3A00Z&severity=ERROR&source=web-server&group_by=day'
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual(mockChartData)
    })

    it('should handle empty chart data', async () => {
      const mockChartData: ChartDataResponse = {
        time_series: [],
        summary: {
          total_count: 0,
          time_range: {
            start: '2024-01-08T00:00:00Z',
            end: '2024-01-08T23:59:59Z'
          },
          group_by: 'hour'
        }
      }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockChartData),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getChartData()

      expect(result.time_series).toHaveLength(0)
      expect(result.summary.total_count).toBe(0)
    })
  })

  describe('exportLogs', () => {
    it('should export logs as CSV blob', async () => {
      const mockBlob = new Blob(['id,message,severity\n1,Test,INFO'], { type: 'text/csv' })
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
        headers: { get: jest.fn().mockReturnValue('text/csv') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.exportLogs()

      expect(mockFetch).toHaveBeenCalledWith('/api/logs/export/csv', expect.any(Object))
      expect(result).toEqual(mockBlob)
      expect(mockResponse.blob).toHaveBeenCalled()
    })

    it('should export logs with filters', async () => {
      const filters: ExportFilters = {
        severity: SeverityLevel.ERROR,
        source: 'database',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      }
      const mockBlob = new Blob(['filtered,csv,data'], { type: 'text/csv' })
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
        headers: { get: jest.fn().mockReturnValue('text/csv') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.exportLogs(filters)

      const expectedUrl = '/api/logs/export/csv?severity=ERROR&source=database&start_date=2024-01-01T00%3A00%3A00Z&end_date=2024-01-08T00%3A00%3A00Z'
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result).toEqual(mockBlob)
    })

    it('should handle export errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ error: 'Export failed' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.exportLogs()).rejects.toThrow('Export failed')
    })
  })

  describe('downloadLogsAsCsv', () => {
    beforeEach(() => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
        headers: { get: jest.fn().mockReturnValue('text/csv') }
      }
      mockFetch.mockResolvedValue(mockResponse)
    })

    it('should download CSV with default filename', async () => {
      await logsService.downloadLogsAsCsv()

      const mockElement = mockCreateElement.mock.results[0].value
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockElement.href).toBe('blob:mock-url')
      expect(mockElement.download).toBe('logs_export.csv')
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement)
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should download CSV with custom filename', async () => {
      const customFilename = 'custom_logs_2024.csv'

      await logsService.downloadLogsAsCsv(undefined, customFilename)

      const mockElement = mockCreateElement.mock.results[0].value
      expect(mockElement.download).toBe(customFilename)
    })

    it('should download CSV with filters and custom filename', async () => {
      const filters: ExportFilters = {
        severity: SeverityLevel.ERROR,
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      }
      const filename = 'error_logs.csv'

      await logsService.downloadLogsAsCsv(filters, filename)

      const expectedUrl = '/api/logs/export/csv?severity=ERROR&start_date=2024-01-01T00%3A00%3A00Z&end_date=2024-01-08T00%3A00%3A00Z'
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      
      const mockElement = mockCreateElement.mock.results[0].value
      expect(mockElement.download).toBe(filename)
    })

    it('should handle download errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ error: 'Export failed' })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(logsService.downloadLogsAsCsv()).rejects.toThrow('Export failed')
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download CSV:', expect.any(Error))
    })

    it('should cleanup resources even if download fails', async () => {
      // Mock successful export but failed DOM manipulation
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
        headers: { get: jest.fn().mockReturnValue('text/csv') }
      }
      mockFetch.mockResolvedValue(mockResponse)
      
      // Make appendChild throw an error
      mockAppendChild.mockImplementation(() => {
        throw new Error('DOM manipulation failed')
      })

      await expect(logsService.downloadLogsAsCsv()).rejects.toThrow('DOM manipulation failed')
      
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download CSV:', expect.any(Error))
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })
  })

  describe('service instance', () => {
    it('should export a singleton instance', () => {
      expect(logsService).toBeDefined()
      expect(typeof logsService.getLogs).toBe('function')
      expect(typeof logsService.getLog).toBe('function')
      expect(typeof logsService.createLog).toBe('function')
      expect(typeof logsService.updateLog).toBe('function')
      expect(typeof logsService.deleteLog).toBe('function')
      expect(typeof logsService.getLogAggregation).toBe('function')
      expect(typeof logsService.getChartData).toBe('function')
      expect(typeof logsService.exportLogs).toBe('function')
      expect(typeof logsService.downloadLogsAsCsv).toBe('function')
    })

    it('should maintain state across multiple calls', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ logs: [] }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      await logsService.getLogs()
      await logsService.getLogAggregation()

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling edge cases', () => {
    it('should handle network timeouts', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network timeout')), 100)
        })
      )

      await expect(logsService.getLogs()).rejects.toThrow('Network timeout')
    })

    it('should handle malformed response content-type header', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
        blob: jest.fn().mockResolvedValue(new Blob()),
        headers: { get: jest.fn().mockReturnValue(null) }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await logsService.getLogs()
      expect(mockResponse.json).toHaveBeenCalled()
      expect(mockResponse.blob).not.toHaveBeenCalled()
    })

    it('should handle concurrent requests', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ logs: [] }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      }
      mockFetch.mockResolvedValue(mockResponse)

      const promises = [
        logsService.getLogs(),
        logsService.getLogAggregation(),
        logsService.getChartData()
      ]

      const results = await Promise.all(promises)
      expect(results).toHaveLength(3)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })
})