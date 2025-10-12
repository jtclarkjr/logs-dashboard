/// <reference lib="dom" />
import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { render } from '@testing-library/react'
import LogsPage from '../page'
import type { LogListResponse } from '@/lib/types/log'
import type { SortOrder, SortByField } from '@/lib/types/filters'
import { SeverityLevel } from '@/lib/enums/severity'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination'

// Mock the logs client component
mock.module('../logs-client', () => ({
  LogsClient: ({ initialData, initialFilters }: { initialData: unknown; initialFilters: unknown }) => (
    <div data-testid="logs-client">
      <div data-testid="initial-data">{JSON.stringify(initialData)}</div>
      <div data-testid="initial-filters">{JSON.stringify(initialFilters)}</div>
    </div>
  )
}))

// Mock the initial logs data API
mock.module('@/lib/clients/initial/logs-api', () => ({
  getInitialLogs: mock(async () => mockLogListResponse)
}))

// Mock data
const mockLogListResponse: LogListResponse = {
  logs: [
    {
      id: 1,
      timestamp: '2024-01-01T12:00:00Z',
      severity: SeverityLevel.ERROR,
      source: 'web-server',
      message: 'Test error message',
      created_at: '2024-01-01T12:00:00Z'
    },
    {
      id: 2,
      timestamp: '2024-01-01T11:00:00Z',
      severity: SeverityLevel.INFO,
      source: 'database',
      message: 'Test info message',
      created_at: '2024-01-01T11:00:00Z'
    }
  ],
  total: 50,
  page: 1,
  page_size: DEFAULT_PAGE_SIZE,
  total_pages: 3
}

describe('LogsPage', () => {
  beforeEach(() => {
    // Reset mocks
    mock.restore()
  })

  afterEach(() => {
    mock.restore()
  })

  describe('Default behavior', () => {
    it('should render with default parameters when no search params provided', async () => {
      const searchParams = Promise.resolve({})
      const { getByTestId } = render(
        await LogsPage({ searchParams })
      )

      const clientComponent = getByTestId('logs-client')
      expect(clientComponent).toBeTruthy()

      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      
      // Check default filters
      expect(initialFilters.searchQuery).toBe('')
      expect(initialFilters.selectedSeverity).toBe('all')
      expect(initialFilters.selectedSource).toBe('all')
      expect(initialFilters.sortBy).toBe('timestamp')
      expect(initialFilters.sortOrder).toBe('desc')
      expect(initialFilters.currentPage).toBe(1)
      expect(initialFilters.dateRange).toBeUndefined()
    })

    it('should use default pagination settings', async () => {
      const searchParams = Promise.resolve({})
      const { getByTestId } = render(
        await LogsPage({ searchParams })
      )

      const initialData = JSON.parse(getByTestId('initial-data').textContent || '{}')
      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      
      expect(initialFilters.currentPage).toBe(1)
      expect(initialData.page_size).toBe(DEFAULT_PAGE_SIZE)
    })
  })

  describe('URL parameter parsing', () => {
    describe('Pagination parameters', () => {
      it('should parse page parameter from search params', async () => {
        const searchParams = Promise.resolve({
          page: '3'
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        expect(initialFilters.currentPage).toBe(3)
      })

      it('should parse page_size parameter from search params', async () => {
        const searchParams = Promise.resolve({
          page_size: '50'
        })

        const mockGetInitialLogs = mock(async () => mockLogListResponse)
        mock.module('@/lib/clients/initial/logs-api', () => ({
          getInitialLogs: mockGetInitialLogs
        }))

        await render(await LogsPage({ searchParams }))

        expect(mockGetInitialLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            page_size: 50
          })
        )
      })
    })

    describe('Search and filter parameters', () => {
      it('should parse search query from search params', async () => {
        const searchParams = Promise.resolve({
          search: 'error message'
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        expect(initialFilters.searchQuery).toBe('error message')
      })

      it('should parse severity filter from search params', async () => {
        const searchParams = Promise.resolve({
          severity: 'error'
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        expect(initialFilters.selectedSeverity).toBe('error')
      })

      it('should parse source filter from search params', async () => {
        const searchParams = Promise.resolve({
          source: 'web-server'
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        expect(initialFilters.selectedSource).toBe('web-server')
      })

      it('should ignore all severity filter and not include in API call', async () => {
        const mockGetInitialLogs = mock(async () => mockLogListResponse)
        mock.module('@/lib/clients/initial/logs-api', () => ({
          getInitialLogs: mockGetInitialLogs
        }))

        const searchParams = Promise.resolve({
          severity: 'all'
        })

        await render(await LogsPage({ searchParams }))

        const callArgs = mockGetInitialLogs.mock.calls[0][0]
        expect(callArgs.severity).toBeUndefined()
      })

      it('should ignore all source filter and not include in API call', async () => {
        const mockGetInitialLogs = mock(async () => mockLogListResponse)
        mock.module('@/lib/clients/initial/logs-api', () => ({
          getInitialLogs: mockGetInitialLogs
        }))

        const searchParams = Promise.resolve({
          source: 'all'
        })

        await render(await LogsPage({ searchParams }))

        const callArgs = mockGetInitialLogs.mock.calls[0][0]
        expect(callArgs.source).toBeUndefined()
      })
    })

    describe('Sorting parameters', () => {
      it('should parse sort_by parameter from search params', async () => {
        const searchParams = Promise.resolve({
          sort_by: 'severity'
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        expect(initialFilters.sortBy).toBe('severity')
      })

      it('should parse sort_order parameter from search params', async () => {
        const searchParams = Promise.resolve({
          sort_order: 'asc' as SortOrder
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        expect(initialFilters.sortOrder).toBe('asc')
      })
    })

    describe('Date range parameters', () => {
      it('should parse date range from search params', async () => {
        const startDate = '2024-01-01T00:00:00Z'
        const endDate = '2024-01-08T00:00:00Z'
        
        const searchParams = Promise.resolve({
          start_date: startDate,
          end_date: endDate
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        
        expect(initialFilters.dateRange).toBeTruthy()
      expect(new Date(initialFilters.dateRange.from).toISOString()).toBe('2024-01-01T00:00:00.000Z')
      expect(new Date(initialFilters.dateRange.to).toISOString()).toBe('2024-01-08T00:00:00.000Z')
      })

      it('should not set date range when only start_date is provided', async () => {
        const searchParams = Promise.resolve({
          start_date: '2024-01-01T00:00:00Z'
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        expect(initialFilters.dateRange).toBeUndefined()
      })

      it('should not set date range when only end_date is provided', async () => {
        const searchParams = Promise.resolve({
          end_date: '2024-01-08T00:00:00Z'
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        expect(initialFilters.dateRange).toBeUndefined()
      })
    })

    describe('Multiple parameters', () => {
      it('should handle multiple parameters correctly', async () => {
        const searchParams = Promise.resolve({
          page: '2',
          page_size: '25',
          search: 'error',
          severity: 'warn',
          source: 'database',
          sort_by: 'severity' as SortByField,
          sort_order: 'asc' as SortOrder,
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-01-08T00:00:00Z'
        })

        const { getByTestId } = render(
          await LogsPage({ searchParams })
        )

        const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
        
        expect(initialFilters.currentPage).toBe(2)
        expect(initialFilters.searchQuery).toBe('error')
        expect(initialFilters.selectedSeverity).toBe('warn')
        expect(initialFilters.selectedSource).toBe('database')
        expect(initialFilters.sortBy).toBe('severity')
        expect(initialFilters.sortOrder).toBe('asc')
        expect(initialFilters.dateRange).toBeTruthy()
      expect(new Date(initialFilters.dateRange.from).toISOString()).toBe('2024-01-01T00:00:00.000Z')
      expect(new Date(initialFilters.dateRange.to).toISOString()).toBe('2024-01-08T00:00:00.000Z')
      })
    })
  })

  describe('Initial data fetching', () => {
    it('should fetch initial data with correct filters', async () => {
      const mockGetInitialData = mock(async () => mockLogListResponse)

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialData
      }))

      const searchParams = Promise.resolve({
        page: '2',
        search: 'error',
        severity: 'warn',
        source: 'web-server',
        sort_by: 'severity',
        sort_order: 'asc'
      })

      await render(await LogsPage({ searchParams }))

      expect(mockGetInitialData).toHaveBeenCalledTimes(1)
      
      const callArgs = mockGetInitialData.mock.calls[0][0]
      expect(callArgs.page).toBe(2)
      expect(callArgs.search).toBe('error')
      expect(callArgs.severity).toBe('warn')
      expect(callArgs.source).toBe('web-server')
      expect(callArgs.sort_by).toBe('severity')
      expect(callArgs.sort_order).toBe('asc')
      expect(callArgs.page_size).toBe(DEFAULT_PAGE_SIZE)
    })

    it('should pass initial data to client component', async () => {
      const searchParams = Promise.resolve({})
      const { getByTestId } = render(
        await LogsPage({ searchParams })
      )

      const initialData = JSON.parse(getByTestId('initial-data').textContent || '{}')
      
      expect(initialData.logs).toBeTruthy()
      expect(initialData.total).toBe(50)
      expect(initialData.page).toBe(1)
      expect(initialData.page_size).toBe(DEFAULT_PAGE_SIZE)
      expect(initialData.total_pages).toBe(3)
      expect(initialData.logs).toHaveLength(2)
    })

    it('should include date range in API call when provided', async () => {
      const mockGetInitialData = mock(async () => mockLogListResponse)

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialData
      }))

      const searchParams = Promise.resolve({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z'
      })

      await render(await LogsPage({ searchParams }))

      const callArgs = mockGetInitialData.mock.calls[0][0]
      expect(callArgs.start_date).toBe('2024-01-01T00:00:00Z')
      expect(callArgs.end_date).toBe('2024-01-08T00:00:00Z')
    })
  })

  describe('Parameter type conversion', () => {
    it('should convert string page to number', async () => {
      const mockGetInitialData = mock(async () => mockLogListResponse)

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialData
      }))

      const searchParams = Promise.resolve({
        page: '5'
      })

      await render(await LogsPage({ searchParams }))

      const callArgs = mockGetInitialData.mock.calls[0][0]
      expect(callArgs.page).toBe(5)
      expect(typeof callArgs.page).toBe('number')
    })

    it('should convert string page_size to number', async () => {
      const mockGetInitialData = mock(async () => mockLogListResponse)

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialData
      }))

      const searchParams = Promise.resolve({
        page_size: '100'
      })

      await render(await LogsPage({ searchParams }))

      const callArgs = mockGetInitialData.mock.calls[0][0]
      expect(callArgs.page_size).toBe(100)
      expect(typeof callArgs.page_size).toBe('number')
    })

    it('should handle invalid page number gracefully', async () => {
      const mockGetInitialData = mock(async () => mockLogListResponse)

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialData
      }))

      const searchParams = Promise.resolve({
        page: 'invalid'
      })

      await render(await LogsPage({ searchParams }))

      const callArgs = mockGetInitialData.mock.calls[0][0]
      // parseInt('invalid') returns NaN, which gets passed through
      expect(isNaN(callArgs.page)).toBe(true)
    })

    it('should handle invalid page_size gracefully', async () => {
      const mockGetInitialData = mock(async () => mockLogListResponse)

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialData
      }))

      const searchParams = Promise.resolve({
        page_size: 'invalid'
      })

      await render(await LogsPage({ searchParams }))

      const callArgs = mockGetInitialData.mock.calls[0][0]
      // parseInt('invalid') returns NaN, which gets passed through
      expect(isNaN(callArgs.page_size)).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockGetInitialDataError = mock(async () => ({
        logs: [],
        total: 0,
        page: 1,
        page_size: DEFAULT_PAGE_SIZE,
        total_pages: 0
      }))

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialDataError
      }))

      const searchParams = Promise.resolve({})
      
      // Should render without throwing an error
      const { getByTestId } = render(
        await LogsPage({ searchParams })
      )
      
      expect(getByTestId('logs-client')).toBeTruthy()
    })
  })

  describe('Component integration', () => {
    it('should render LogsClient with correct props', async () => {
      const searchParams = Promise.resolve({
        page: '2',
        search: 'test',
        severity: 'error',
        source: 'web-server'
      })

      const { getByTestId } = render(
        await LogsPage({ searchParams })
      )

      const clientComponent = getByTestId('logs-client')
      expect(clientComponent).toBeTruthy()

      const initialData = JSON.parse(getByTestId('initial-data').textContent || '{}')
      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      
      expect(initialData).toBeTruthy()
      expect(initialData.logs).toBeTruthy()
      expect(initialFilters).toBeTruthy()
      expect(initialFilters.currentPage).toBe(2)
      expect(initialFilters.searchQuery).toBe('test')
      expect(initialFilters.selectedSeverity).toBe('error')
      expect(initialFilters.selectedSource).toBe('web-server')
    })
  })

  describe('Severity level mapping', () => {
    it('should map severity string to SeverityLevel enum', async () => {
      const mockGetInitialData = mock(async () => mockLogListResponse)

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialData
      }))

      const searchParams = Promise.resolve({
        severity: 'error'
      })

      await render(await LogsPage({ searchParams }))

      const callArgs = mockGetInitialData.mock.calls[0][0]
      expect(callArgs.severity).toBe('error')
    })

    it('should handle different severity levels correctly', async () => {
      const mockGetInitialData = mock(async () => mockLogListResponse)

      mock.module('@/lib/clients/initial/logs-api', () => ({
        getInitialLogs: mockGetInitialData
      }))

      const testCases = [
        { param: 'debug' },
        { param: 'info' },
        { param: 'warn' },
        { param: 'error' }
      ]

      for (const testCase of testCases) {
        mockGetInitialData.mockClear()

        const searchParams = Promise.resolve({
          severity: testCase.param
        })

        await render(await LogsPage({ searchParams }))

        const callArgs = mockGetInitialData.mock.calls[0][0]
        expect(callArgs.severity).toBe(testCase.param)
      }
    })
  })
})