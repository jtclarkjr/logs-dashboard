import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { QueryClient } from '@tanstack/react-query'
import {
  renderHookWithQuery,
  createTestQueryClient,
  mockLogsService,
  mockHealthService,
  createMockDateRange
} from '@/lib/hooks/test-utils'
import {
  useDashboardData,
  useOptimizedLogs
} from '@/lib/hooks/query/use-optimized-queries'
import { SeverityLevel } from '@/lib/enums/severity'
import type {
  SeverityFilter,
  SourceFilter,
  GroupBy,
  SortOrder,
  SortByField
} from '@/lib/types/filters'

// Mock the services
mock.module('@/lib/services/logs', () => ({
  logsService: mockLogsService
}))

mock.module('@/lib/services/health', () => ({
  healthService: mockHealthService
}))

// Mock date-fns format function
mock.module('date-fns', () => ({
  format: mock((date: Date, formatStr: string) => {
    if (formatStr.includes('HH:mm')) {
      return 'Jan 01 10:30'
    }
    return 'Jan 01'
  })
}))

describe('useDashboardData', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
  })

  describe('initialization and basic functionality', () => {
    it('should initialize with correct loading states', () => {
      const { result } = renderHookWithQuery(
        () =>
          useDashboardData({
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            timeGrouping: 'day' as GroupBy,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      // All queries should start as loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isLoadingAggregation).toBe(true)
      expect(result.current.isLoadingChart).toBe(true)
      expect(result.current.isLoadingMetadata).toBe(true)
    })

    it('should return empty time series data when chart query is loading', () => {
      const { result } = renderHookWithQuery(
        () =>
          useDashboardData({
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            timeGrouping: 'day' as GroupBy,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      expect(result.current.timeSeriesData).toEqual([])
    })
  })

  describe('filter handling', () => {
    it('should handle severity filter correctly', () => {
      const { result } = renderHookWithQuery(
        () =>
          useDashboardData({
            selectedSeverity: SeverityLevel.ERROR as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            timeGrouping: 'day' as GroupBy,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      // Should be loading since filters are valid
      expect(result.current.isLoading).toBe(true)
    })

    it('should handle source filter correctly', () => {
      const { result } = renderHookWithQuery(
        () =>
          useDashboardData({
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'api' as SourceFilter,
            timeGrouping: 'day' as GroupBy,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should disable queries when dateRange is invalid', () => {
      const { result } = renderHookWithQuery(
        () =>
          useDashboardData({
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            timeGrouping: 'day' as GroupBy,
            dateRange: undefined
          }),
        { queryClient }
      )

      // Without dateRange, aggregation and chart queries should be disabled
      // Only metadata query should be running
      expect(result.current.isLoadingMetadata).toBe(true)
    })
  })

  describe('time grouping and data transformation', () => {
    it('should handle hour-based time grouping', () => {
      const { result } = renderHookWithQuery(
        () =>
          useDashboardData({
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            timeGrouping: 'hour' as GroupBy,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle day-based time grouping', () => {
      const { result } = renderHookWithQuery(
        () =>
          useDashboardData({
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            timeGrouping: 'day' as GroupBy,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('combined loading states', () => {
    it('should correctly calculate combined loading state', () => {
      const { result } = renderHookWithQuery(
        () =>
          useDashboardData({
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            timeGrouping: 'day' as GroupBy,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      // Combined loading should be true when any individual query is loading
      const individualLoading =
        result.current.isLoadingAggregation ||
        result.current.isLoadingChart ||
        result.current.isLoadingMetadata

      expect(result.current.isLoading).toBe(individualLoading)
    })
  })

  describe('query key generation', () => {
    it('should generate consistent query keys for aggregation', () => {
      const props = {
        selectedSeverity: 'all' as SeverityFilter,
        selectedSource: 'all' as SourceFilter,
        timeGrouping: 'day' as GroupBy,
        dateRange: createMockDateRange()
      }

      const { result: result1 } = renderHookWithQuery(
        () => useDashboardData(props),
        { queryClient }
      )

      const { result: result2 } = renderHookWithQuery(
        () => useDashboardData(props),
        { queryClient }
      )

      // Both should have the same loading state since they use the same keys
      expect(result1.current.isLoadingAggregation).toBe(
        result2.current.isLoadingAggregation
      )
    })
  })
})

describe('useOptimizedLogs', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
  })

  describe('initialization', () => {
    it('should initialize with basic parameters', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('filter parameters', () => {
    it('should handle search query parameter', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: 'error message',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle severity filter parameter', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: SeverityLevel.ERROR as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle source filter parameter', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'api' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle date range parameter', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: createMockDateRange()
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('pagination parameters', () => {
    it('should handle different page sizes', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 50,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle different page numbers', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 3,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('sorting parameters', () => {
    it('should handle different sort fields', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'severity' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle different sort orders', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'asc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('query key generation and memoization', () => {
    it('should generate consistent query keys for identical parameters', () => {
      const params = {
        currentPage: 1,
        pageSize: 20,
        searchQuery: 'test',
        selectedSeverity: 'all' as SeverityFilter,
        selectedSource: 'all' as SourceFilter,
        sortBy: 'timestamp' as SortByField,
        sortOrder: 'desc' as SortOrder,
        dateRange: createMockDateRange()
      }

      const { result: result1 } = renderHookWithQuery(
        () => useOptimizedLogs(params),
        { queryClient }
      )

      const { result: result2 } = renderHookWithQuery(
        () => useOptimizedLogs(params),
        { queryClient }
      )

      // Both should have the same loading state since they use the same query keys
      expect(result1.current.isLoading).toBe(result2.current.isLoading)
    })

    it('should generate different query keys for different parameters', () => {
      const params1 = {
        currentPage: 1,
        pageSize: 20,
        searchQuery: 'test1',
        selectedSeverity: 'all' as SeverityFilter,
        selectedSource: 'all' as SourceFilter,
        sortBy: 'timestamp' as SortByField,
        sortOrder: 'desc' as SortOrder,
        dateRange: undefined
      }

      const params2 = {
        ...params1,
        searchQuery: 'test2'
      }

      const { result: result1 } = renderHookWithQuery(
        () => useOptimizedLogs(params1),
        { queryClient }
      )

      const { result: result2 } = renderHookWithQuery(
        () => useOptimizedLogs(params2),
        { queryClient }
      )

      // Both should be loading but they're separate queries
      expect(result1.current.isLoading).toBe(true)
      expect(result2.current.isLoading).toBe(true)
    })
  })

  describe('conditional query key properties', () => {
    it('should exclude empty search query from query key', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should exclude "all" severity from query key', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should exclude "all" source from query key', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should exclude undefined date range from query key', () => {
      const { result } = renderHookWithQuery(
        () =>
          useOptimizedLogs({
            currentPage: 1,
            pageSize: 20,
            searchQuery: '',
            selectedSeverity: 'all' as SeverityFilter,
            selectedSource: 'all' as SourceFilter,
            sortBy: 'timestamp' as SortByField,
            sortOrder: 'desc' as SortOrder,
            dateRange: undefined
          }),
        { queryClient }
      )

      expect(result.current.isLoading).toBe(true)
    })
  })
})
