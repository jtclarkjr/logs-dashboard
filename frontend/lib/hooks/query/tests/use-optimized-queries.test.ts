import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { SeverityLevel } from '@/lib/enums/severity'
import type {
  SeverityFilter,
  SourceFilter,
  GroupBy,
  SortByField,
  SortOrder
} from '@/lib/types/filters'

// Mock query results
let mockUseQueryResult = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null
}

interface QueryFilters {
  page?: number
  page_size?: number
  search?: string
  severity?: string
  source?: string
  sort_by?: string
  sort_order?: string
  start_date?: string
  end_date?: string
}

let useQueryCallLog: Array<{
  queryKey: [string, QueryFilters] | [string]
  queryFn: (...args: unknown[]) => Promise<unknown>
  enabled?: boolean
  select?: (data: unknown) => unknown
  staleTime?: number
}> = []

// Mock the services
const mockLogsService = {
  getLogs: mock(() => Promise.resolve({
    logs: [
      { id: '1', message: 'Test log', severity: SeverityLevel.INFO, timestamp: '2023-01-01T10:00:00Z' }
    ],
    total: 1,
    page: 1,
    page_size: 10,
    total_pages: 1
  })),
  getLogAggregation: mock(() => Promise.resolve({
    total_logs: 100,
    by_severity: [{ severity: SeverityLevel.ERROR, count: 50 }],
    by_source: [{ source: 'api', count: 75 }],
    by_date: [{ date: '2023-01-01', count: 100 }]
  })),
  getChartData: mock(() => Promise.resolve({
    data: [
      { timestamp: '2023-01-01T10:00:00Z', count: 10 },
      { timestamp: '2023-01-01T11:00:00Z', count: 15 }
    ]
  }))
}

const mockHealthService = {
  getMetadata: mock(() => Promise.resolve({
    severity_levels: [SeverityLevel.ERROR, SeverityLevel.INFO],
    sources: ['api', 'worker']
  }))
}

// Mock filter helpers
const mockCreateAggregationFilters = mock((dateRange: { from?: Date; to?: Date } | undefined, severity: string, source: string) => {
  if (!dateRange) return undefined
  return {
    start_date: dateRange.from?.toISOString(),
    end_date: dateRange.to?.toISOString(),
    ...(severity !== 'all' && { severity }),
    ...(source !== 'all' && { source })
  }
})

const mockCreateChartFilters = mock((dateRange: { from?: Date; to?: Date } | undefined, severity: string, source: string, groupBy: string) => {
  if (!dateRange) return undefined
  return {
    start_date: dateRange.from?.toISOString(),
    end_date: dateRange.to?.toISOString(),
    ...(severity !== 'all' && { severity }),
    ...(source !== 'all' && { source }),
    group_by: groupBy
  }
})

// Mock the date-fns format function
const mockFormat = mock((date: Date, formatStr: string) => {
  if (formatStr.includes('HH:mm')) {
    return 'Jan 01 10:30'
  }
  return 'Jan 01'
})

mock.module('@/lib/services/logs', () => ({
  logsService: mockLogsService
}))

mock.module('@/lib/services/health', () => ({
  healthService: mockHealthService
}))

mock.module('@/lib/utils/filter-helpers', () => ({
  createAggregationFilters: mockCreateAggregationFilters,
  createChartFilters: mockCreateChartFilters
}))

mock.module('date-fns', () => ({
  format: mockFormat
}))

// Mock React Query useQuery hook
mock.module('@tanstack/react-query', () => ({
  useQuery: mock((options: {
    queryKey: [string, QueryFilters] | [string]
    queryFn: (...args: unknown[]) => Promise<unknown>
    enabled?: boolean
    select?: (data: unknown) => unknown
    staleTime?: number
  }) => {
    useQueryCallLog.push(options)
    return mockUseQueryResult
  })
}))

describe('use-optimized-queries', () => {
  beforeEach(() => {
    // Reset mocks and call log
    useQueryCallLog = []
    mockUseQueryResult = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null
    }
    
    // Reset mock call counts
    mockLogsService.getLogs.mockClear()
    mockLogsService.getLogAggregation.mockClear()
    mockLogsService.getChartData.mockClear()
    mockHealthService.getMetadata.mockClear()
    mockCreateAggregationFilters.mockClear()
    mockCreateChartFilters.mockClear()
    mockFormat.mockClear()
  })

  describe('useDashboardData hook', () => {
    it('should call createAggregationFilters with correct parameters', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const dateRange = {
        from: new Date('2023-01-01'),
        to: new Date('2023-01-02')
      }
      const selectedSeverity: SeverityFilter = SeverityLevel.ERROR
      const selectedSource: SourceFilter = 'api'
      const timeGrouping: GroupBy = 'day'
      
      useDashboardData({ dateRange, selectedSeverity, selectedSource, timeGrouping })
      
      expect(mockCreateAggregationFilters).toHaveBeenCalledWith(
        dateRange,
        selectedSeverity,
        selectedSource
      )
    })

    it('should call createChartFilters with correct parameters', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const dateRange = {
        from: new Date('2023-01-01'),
        to: new Date('2023-01-02')
      }
      const selectedSeverity: SeverityFilter = SeverityLevel.INFO
      const selectedSource: SourceFilter = 'worker'
      const timeGrouping: GroupBy = 'hour'
      
      useDashboardData({ dateRange, selectedSeverity, selectedSource, timeGrouping })
      
      expect(mockCreateChartFilters).toHaveBeenCalledWith(
        dateRange,
        selectedSeverity,
        selectedSource,
        timeGrouping
      )
    })

    it('should create three useQuery calls for aggregation, chart, and metadata', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const dateRange = {
        from: new Date('2023-01-01'),
        to: new Date('2023-01-02')
      }
      
      useDashboardData({
        dateRange,
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      expect(useQueryCallLog).toHaveLength(3)
      expect(useQueryCallLog[0].queryKey[0]).toBe('log-aggregation')
      expect(useQueryCallLog[1].queryKey[0]).toBe('chart-data')
      expect(useQueryCallLog[2].queryKey[0]).toBe('metadata')
    })

    it('should set enabled: false when aggregationFilters is undefined', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      // No dateRange will make aggregationFilters undefined
      useDashboardData({
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      expect(useQueryCallLog[0].enabled).toBe(false)
      expect(useQueryCallLog[1].enabled).toBe(false)
    })

    it('should set enabled: true when filters are provided', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const dateRange = {
        from: new Date('2023-01-01'),
        to: new Date('2023-01-02')
      }
      
      useDashboardData({
        dateRange,
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      expect(useQueryCallLog[0].enabled).toBe(true)
      expect(useQueryCallLog[1].enabled).toBe(true)
    })

    it('should call queryFn for aggregation data', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const dateRange = {
        from: new Date('2023-01-01'),
        to: new Date('2023-01-02')
      }
      
      useDashboardData({
        dateRange,
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      // Call the aggregation queryFn
      await useQueryCallLog[0].queryFn()
      expect(mockLogsService.getLogAggregation).toHaveBeenCalled()
    })

    it('should call queryFn for chart data', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const dateRange = {
        from: new Date('2023-01-01'),
        to: new Date('2023-01-02')
      }
      
      useDashboardData({
        dateRange,
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      // Call the chart data queryFn
      await useQueryCallLog[1].queryFn()
      expect(mockLogsService.getChartData).toHaveBeenCalled()
    })

    it('should call queryFn for metadata', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      useDashboardData({
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      // Call the metadata queryFn
      await useQueryCallLog[2].queryFn()
      expect(mockHealthService.getMetadata).toHaveBeenCalled()
    })

    it('should set staleTime for metadata query', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      useDashboardData({
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      expect(useQueryCallLog[2].staleTime).toBe(10 * 60 * 1000) // 10 minutes
    })

    it('should apply select transformation for chart data with hour grouping', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const dateRange = {
        from: new Date('2023-01-01'),
        to: new Date('2023-01-02')
      }
      
      useDashboardData({
        dateRange,
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'hour'
      })
      
      const selectFn = useQueryCallLog[1].select
      expect(selectFn).toBeDefined()
      
      // Test select function with mock data
      const mockChartData = {
        data: [
          { timestamp: '2023-01-01T10:00:00Z', count: 10 },
          { timestamp: '2023-01-01T11:00:00Z', count: 15 }
        ]
      }
      
      const result = selectFn!(mockChartData)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        timestamp: '2023-01-01T10:00:00Z',
        count: 10,
        date: 'Jan 01 10:30'
      })
      expect(mockFormat).toHaveBeenCalledWith(new Date('2023-01-01T10:00:00Z'), 'MMM dd HH:mm')
    })

    it('should apply select transformation for chart data with day grouping', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const dateRange = {
        from: new Date('2023-01-01'),
        to: new Date('2023-01-02')
      }
      
      useDashboardData({
        dateRange,
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      const selectFn = useQueryCallLog[1].select
      const mockChartData = {
        data: [
          { timestamp: '2023-01-01T10:00:00Z', count: 10 }
        ]
      }
      
      const result = selectFn!(mockChartData)
      expect(result[0].date).toBe('Jan 01')
      expect(mockFormat).toHaveBeenCalledWith(new Date('2023-01-01T10:00:00Z'), 'MMM dd')
    })

    it('should handle empty chart data in select transformation', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      useDashboardData({
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      const selectFn = useQueryCallLog[1].select
      expect(selectFn!({ data: null })).toEqual([])
      expect(selectFn!({})).toEqual([])
      expect(selectFn!(null)).toEqual([])
    })

    it('should return properly structured hook result', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      mockUseQueryResult = {
        data: { test: 'data' },
        isLoading: true,
        isError: false,
        error: null
      }
      
      const result = useDashboardData({
        selectedSeverity: 'all',
        selectedSource: 'all',
        timeGrouping: 'day'
      })
      
      expect(result).toHaveProperty('aggregationData')
      expect(result).toHaveProperty('isLoadingAggregation')
      expect(result).toHaveProperty('aggregationError')
      expect(result).toHaveProperty('timeSeriesData')
      expect(result).toHaveProperty('isLoadingChart')
      expect(result).toHaveProperty('chartError')
      expect(result).toHaveProperty('metadata')
      expect(result).toHaveProperty('isLoadingMetadata')
      expect(result).toHaveProperty('metadataError')
      expect(result).toHaveProperty('isLoading')
      
      expect(result.isLoading).toBe(true) // Combined loading state
      // timeSeriesData should be the chart query data or empty array if undefined
      expect(result.timeSeriesData).toEqual(mockUseQueryResult.data || [])
    })
  })

  describe('useOptimizedLogs hook', () => {
    it('should create useQuery call with correct queryKey', async () => {
      const { useOptimizedLogs } = await import('@/lib/hooks/query/use-optimized-queries')
      
      const params = {
        currentPage: 1,
        pageSize: 20,
        searchQuery: 'test search',
        selectedSeverity: SeverityLevel.ERROR as SeverityFilter,
        selectedSource: 'api' as SourceFilter,
        sortBy: 'timestamp' as SortByField,
        sortOrder: 'desc' as SortOrder,
        dateRange: {
          from: new Date('2023-01-01'),
          to: new Date('2023-01-02')
        }
      }
      
      useOptimizedLogs(params)
      
      expect(useQueryCallLog).toHaveLength(1)
      expect(useQueryCallLog[0].queryKey[0]).toBe('logs')
      
      const queryFilters = useQueryCallLog[0].queryKey[1] as QueryFilters
      expect(queryFilters.page).toBe(1)
      expect(queryFilters.page_size).toBe(20)
      expect(queryFilters.search).toBe('test search')
      expect(queryFilters.severity).toBe(SeverityLevel.ERROR)
      expect(queryFilters.source).toBe('api')
      expect(queryFilters.sort_by).toBe('timestamp')
      expect(queryFilters.sort_order).toBe('desc')
      expect(queryFilters.start_date).toBe(params.dateRange.from.toISOString())
      expect(queryFilters.end_date).toBe(params.dateRange.to.toISOString())
    })

    it('should exclude "all" severity from queryKey', async () => {
      const { useOptimizedLogs } = await import('@/lib/hooks/query/use-optimized-queries')
      
      useOptimizedLogs({
        currentPage: 1,
        pageSize: 10,
        searchQuery: '',
        selectedSeverity: 'all',
        selectedSource: 'all',
        sortBy: 'timestamp',
        sortOrder: 'desc'
      })
      
      const queryFilters = useQueryCallLog[0].queryKey[1] as QueryFilters
      expect(queryFilters.severity).toBeUndefined()
      expect(queryFilters.source).toBeUndefined()
    })

    it('should exclude empty search query from queryKey', async () => {
      const { useOptimizedLogs } = await import('@/lib/hooks/query/use-optimized-queries')
      
      useOptimizedLogs({
        currentPage: 1,
        pageSize: 10,
        searchQuery: '',
        selectedSeverity: 'all',
        selectedSource: 'all',
        sortBy: 'timestamp',
        sortOrder: 'desc'
      })
      
      const queryFilters = useQueryCallLog[0].queryKey[1] as QueryFilters
      expect(queryFilters.search).toBeUndefined()
    })

    it('should exclude undefined dateRange from queryKey', async () => {
      const { useOptimizedLogs } = await import('@/lib/hooks/query/use-optimized-queries')
      
      useOptimizedLogs({
        currentPage: 1,
        pageSize: 10,
        searchQuery: '',
        selectedSeverity: 'all',
        selectedSource: 'all',
        sortBy: 'timestamp',
        sortOrder: 'desc'
      })
      
      const queryFilters = useQueryCallLog[0].queryKey[1] as QueryFilters
      expect(queryFilters.start_date).toBeUndefined()
      expect(queryFilters.end_date).toBeUndefined()
    })

    it('should call queryFn with correct parameters', async () => {
      const { useOptimizedLogs } = await import('@/lib/hooks/query/use-optimized-queries')
      
      useOptimizedLogs({
        currentPage: 2,
        pageSize: 15,
        searchQuery: 'error',
        selectedSeverity: SeverityLevel.WARNING as SeverityFilter,
        selectedSource: 'worker' as SourceFilter,
        sortBy: 'message',
        sortOrder: 'asc'
      })
      
      // Call the queryFn
      const queryFn = useQueryCallLog[0].queryFn
      const mockQueryKey = [
        'logs',
        {
          page: 2,
          page_size: 15,
          search: 'error',
          severity: SeverityLevel.WARNING,
          source: 'worker',
          sort_by: 'message',
          sort_order: 'asc'
        }
      ]
      
      await queryFn({ queryKey: mockQueryKey })
      
      expect(mockLogsService.getLogs).toHaveBeenCalledWith(mockQueryKey[1])
    })

    it('should handle partial dateRange correctly', async () => {
      const { useOptimizedLogs } = await import('@/lib/hooks/query/use-optimized-queries')
      
      // Test with only from date
      useOptimizedLogs({
        currentPage: 1,
        pageSize: 10,
        searchQuery: '',
        selectedSeverity: 'all',
        selectedSource: 'all',
        sortBy: 'timestamp',
        sortOrder: 'desc',
        dateRange: {
          from: new Date('2023-01-01'),
          to: undefined
        }
      })
      
      const queryFilters = useQueryCallLog[0].queryKey[1] as QueryFilters
      expect(queryFilters.start_date).toBeDefined()
      expect(queryFilters.end_date).toBeUndefined()
    })

    it('should return useQuery result directly', async () => {
      const { useOptimizedLogs } = await import('@/lib/hooks/query/use-optimized-queries')
      
      mockUseQueryResult = {
        data: { logs: [], total: 0 },
        isLoading: false,
        isError: false,
        error: null
      }
      
      const result = useOptimizedLogs({
        currentPage: 1,
        pageSize: 10,
        searchQuery: '',
        selectedSeverity: 'all',
        selectedSource: 'all',
        sortBy: 'timestamp',
        sortOrder: 'desc'
      })
      
      expect(result).toBe(mockUseQueryResult)
    })
  })

  describe('Integration and edge cases', () => {
    it('should handle all hook parameters correctly', async () => {
      const { useDashboardData, useOptimizedLogs } = await import('@/lib/hooks/query/use-optimized-queries')
      
      // Test both hooks can be called
      expect(typeof useDashboardData).toBe('function')
      expect(typeof useOptimizedLogs).toBe('function')
      
      // Call both hooks to ensure no conflicts
      useDashboardData({
        selectedSeverity: SeverityLevel.INFO,
        selectedSource: 'test',
        timeGrouping: 'week'
      })
      
      useOptimizedLogs({
        currentPage: 1,
        pageSize: 10,
        searchQuery: '',
        selectedSeverity: 'all',
        selectedSource: 'all',
        sortBy: 'timestamp',
        sortOrder: 'desc'
      })
      
      expect(useQueryCallLog).toHaveLength(4) // 3 from useDashboardData + 1 from useOptimizedLogs
    })

    it('should handle different filter combinations', async () => {
      const { useDashboardData } = await import('@/lib/hooks/query/use-optimized-queries')
      
      // Test with mixed filter values
      useDashboardData({
        selectedSeverity: SeverityLevel.DEBUG,
        selectedSource: 'all',
        timeGrouping: 'month'
      })
      
      expect(mockCreateAggregationFilters).toHaveBeenCalledWith(
        undefined,
        SeverityLevel.DEBUG,
        'all'
      )
      expect(mockCreateChartFilters).toHaveBeenCalledWith(
        undefined,
        SeverityLevel.DEBUG,
        'all',
        'month'
      )
    })
  })
})
