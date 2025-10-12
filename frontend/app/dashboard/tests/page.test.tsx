/// <reference lib="dom" />
import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { render } from '@testing-library/react'
import { subDays } from 'date-fns'
import DashboardPage from '../page'
import type { LogAggregationResponse } from '@/lib/types/log'
import type { MetadataResponse } from '@/lib/types/common'
import type { GroupBy } from '@/lib/types/filters'
import { SeverityLevel } from '@/lib/enums/severity'

// Mock the dashboard client component
mock.module('../dashboard-client', () => ({
  DashboardClient: ({ initialData, initialFilters }: { initialData: unknown; initialFilters: unknown }) => (
    <div data-testid="dashboard-client">
      <div data-testid="initial-data">{JSON.stringify(initialData)}</div>
      <div data-testid="initial-filters">{JSON.stringify(initialFilters)}</div>
    </div>
  )
}))

// Mock the initial dashboard data API
mock.module('@/lib/clients/initial/dashboard-api', () => ({
  getInitialDashboardData: mock(async () => ({
    aggregationData: mockAggregationData,
    metadata: mockMetadata
  }))
}))

// Mock data
const mockAggregationData: LogAggregationResponse = {
  total_logs: 1000,
  date_range_start: '2024-01-01T00:00:00Z',
  date_range_end: '2024-01-08T00:00:00Z',
  by_severity: [
    { severity: SeverityLevel.ERROR, count: 50 },
    { severity: SeverityLevel.WARNING, count: 200 },
    { severity: SeverityLevel.INFO, count: 500 },
    { severity: SeverityLevel.DEBUG, count: 250 }
  ],
  by_source: [
    { source: 'web-server', count: 600 },
    { source: 'database', count: 300 },
    { source: 'cache', count: 100 }
  ],
  by_date: [
    { date: '2024-01-01', count: 1000 }
  ]
}

const mockMetadata: MetadataResponse = {
  severity_levels: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
  sources: ['web-server', 'database', 'cache'],
  date_range: {
    earliest: '2024-01-01T00:00:00Z',
    latest: '2024-01-08T00:00:00Z'
  },
  severity_stats: {
    ERROR: 50,
    WARNING: 200,
    INFO: 500,
    DEBUG: 250
  },
  total_logs: 1000,
  sort_fields: ['timestamp', 'severity'],
  pagination: {
    default_page_size: 10,
    max_page_size: 100
  }
}

describe('DashboardPage', () => {
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
        await DashboardPage({ searchParams })
      )

      const clientComponent = getByTestId('dashboard-client')
      expect(clientComponent).toBeTruthy()

      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      
      // Check default filters
      expect(initialFilters.selectedSeverity).toBe('all')
      expect(initialFilters.selectedSource).toBe('all')
      expect(initialFilters.timeGrouping).toBe('day')
      expect(initialFilters.dateRange).toBeTruthy()
      expect(new Date(initialFilters.dateRange.from)).toBeInstanceOf(Date)
      expect(new Date(initialFilters.dateRange.to)).toBeInstanceOf(Date)
    })

    it('should use 7-day default date range', async () => {
      const searchParams = Promise.resolve({})
      const { getByTestId } = render(
        await DashboardPage({ searchParams })
      )

      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      const fromDate = new Date(initialFilters.dateRange.from)
      const toDate = new Date(initialFilters.dateRange.to)
      
      const expectedFromDate = subDays(new Date(), 7)
      const daysDifference = Math.abs(fromDate.getTime() - expectedFromDate.getTime()) / (1000 * 60 * 60 * 24)
      
      expect(daysDifference).toBeLessThan(1) // Within 1 day tolerance
      expect(toDate.getDate()).toBe(new Date().getDate())
    })
  })

  describe('URL parameter parsing', () => {
    it('should parse date range from search params', async () => {
      const startDate = '2024-01-01T00:00:00Z'
      const endDate = '2024-01-08T00:00:00Z'
      
      const searchParams = Promise.resolve({
        start_date: startDate,
        end_date: endDate
      })

      const { getByTestId } = render(
        await DashboardPage({ searchParams })
      )

      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      
      expect(new Date(initialFilters.dateRange.from).toISOString()).toBe('2024-01-01T00:00:00.000Z')
      expect(new Date(initialFilters.dateRange.to).toISOString()).toBe('2024-01-08T00:00:00.000Z')
    })

    it('should parse severity filter from search params', async () => {
      const searchParams = Promise.resolve({
        severity: 'error'
      })

      const { getByTestId } = render(
        await DashboardPage({ searchParams })
      )

      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      expect(initialFilters.selectedSeverity).toBe('error')
    })

    it('should parse source filter from search params', async () => {
      const searchParams = Promise.resolve({
        source: 'web-server'
      })

      const { getByTestId } = render(
        await DashboardPage({ searchParams })
      )

      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      expect(initialFilters.selectedSource).toBe('web-server')
    })

    it('should parse time grouping from search params', async () => {
      const searchParams = Promise.resolve({
        group_by: 'hour' as GroupBy
      })

      const { getByTestId } = render(
        await DashboardPage({ searchParams })
      )

      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      expect(initialFilters.timeGrouping).toBe('hour')
    })

    it('should handle multiple parameters correctly', async () => {
      const searchParams = Promise.resolve({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-08T00:00:00Z',
        severity: 'error',
        source: 'database',
        group_by: 'hour' as GroupBy
      })

      const { getByTestId } = render(
        await DashboardPage({ searchParams })
      )

      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      
      expect(initialFilters.selectedSeverity).toBe('error')
      expect(initialFilters.selectedSource).toBe('database')
      expect(initialFilters.timeGrouping).toBe('hour')
      expect(new Date(initialFilters.dateRange.from).toISOString()).toBe('2024-01-01T00:00:00.000Z')
      expect(new Date(initialFilters.dateRange.to).toISOString()).toBe('2024-01-08T00:00:00.000Z')
    })
  })

  describe('Initial data fetching', () => {
    it('should fetch initial data with correct filters', async () => {
      const mockGetInitialData = mock(async () => ({
        aggregationData: mockAggregationData,
        metadata: mockMetadata
      }))

      mock.module('@/lib/clients/initial/dashboard-api', () => ({
        getInitialDashboardData: mockGetInitialData
      }))

      const searchParams = Promise.resolve({
        severity: 'error',
        source: 'web-server',
        group_by: 'hour' as GroupBy
      })

      await render(await DashboardPage({ searchParams }))

      expect(mockGetInitialData).toHaveBeenCalledTimes(1)
    })

    it('should pass initial data to client component', async () => {
      const searchParams = Promise.resolve({})
      const { getByTestId } = render(
        await DashboardPage({ searchParams })
      )

      const initialData = JSON.parse(getByTestId('initial-data').textContent || '{}')
      
      expect(initialData.aggregationData).toBeTruthy()
      expect(initialData.metadata).toBeTruthy()
      expect(initialData.aggregationData.total_logs).toBe(1000)
    })
  })

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockGetInitialDataError = mock(async () => ({
        aggregationData: undefined,
        timeSeriesData: undefined,
        metadata: undefined
      }))

      mock.module('@/lib/clients/initial/dashboard-api', () => ({
        getInitialDashboardData: mockGetInitialDataError
      }))

      const searchParams = Promise.resolve({})
      
      // Should render without throwing an error
      const result = render(
        await DashboardPage({ searchParams })
      )
      
      expect(result.container.firstChild).toBeTruthy()
    })
  })

  describe('Component integration', () => {
    it('should render DashboardClient with correct props', async () => {
      const searchParams = Promise.resolve({
        severity: 'warn',
        source: 'database'
      })

      const { getByTestId } = render(
        await DashboardPage({ searchParams })
      )

      const clientComponent = getByTestId('dashboard-client')
      expect(clientComponent).toBeTruthy()

      const initialData = JSON.parse(getByTestId('initial-data').textContent || '{}')
      const initialFilters = JSON.parse(getByTestId('initial-filters').textContent || '{}')
      
      expect(initialData).toBeTruthy()
      expect(initialFilters).toBeTruthy()
      expect(initialFilters.selectedSeverity).toBe('warn')
      expect(initialFilters.selectedSource).toBe('database')
    })
  })
})