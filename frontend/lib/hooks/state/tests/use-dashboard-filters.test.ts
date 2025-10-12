/// <reference lib="dom" />
import { describe, it, expect } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useDashboardFilters } from '@/lib/hooks/state/use-dashboard-filters'
import { createMockDateRange } from '@/lib/hooks/test-utils'
import { SeverityLevel } from '@/lib/enums/severity'

describe('useDashboardFilters', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDashboardFilters())

    expect(result.current.selectedSeverity).toBe('all')
    expect(result.current.selectedSource).toBe('all')
    expect(result.current.timeGrouping).toBe('day')
    expect(result.current.dateRange).toEqual({
      from: expect.any(Date),
      to: expect.any(Date)
    })
  })

  it('should initialize with provided initial filters', () => {
    const initialFilters = {
      selectedSeverity: SeverityLevel.ERROR,
      selectedSource: 'api',
      timeGrouping: 'hour' as const,
      dateRange: createMockDateRange()
    }

    const { result } = renderHook(() => useDashboardFilters(initialFilters))

    expect(result.current.selectedSeverity).toBe(SeverityLevel.ERROR)
    expect(result.current.selectedSource).toBe('api')
    expect(result.current.timeGrouping).toBe('hour')
    expect(result.current.dateRange).toEqual(initialFilters.dateRange)
  })

  it('should update dateRange correctly', () => {
    const { result } = renderHook(() => useDashboardFilters())
    const newDateRange = createMockDateRange()

    act(() => {
      result.current.setDateRange(newDateRange)
    })

    expect(result.current.dateRange).toEqual(newDateRange)
  })

  it('should update selectedSeverity correctly', () => {
    const { result } = renderHook(() => useDashboardFilters())

    act(() => {
      result.current.setSelectedSeverity(SeverityLevel.ERROR)
    })

    expect(result.current.selectedSeverity).toBe(SeverityLevel.ERROR)
  })

  it('should update selectedSource correctly', () => {
    const { result } = renderHook(() => useDashboardFilters())

    act(() => {
      result.current.setSelectedSource('api')
    })

    expect(result.current.selectedSource).toBe('api')
  })

  it('should update timeGrouping correctly', () => {
    const { result } = renderHook(() => useDashboardFilters())

    act(() => {
      result.current.setTimeGrouping('hour')
    })

    expect(result.current.timeGrouping).toBe('hour')
  })

  it('should reset filters to default values', () => {
    const { result } = renderHook(() => useDashboardFilters())

    // Set some non-default values
    act(() => {
      result.current.setSelectedSeverity(SeverityLevel.ERROR)
      result.current.setSelectedSource('api')
      result.current.setTimeGrouping('hour')
    })

    // Reset filters
    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.selectedSeverity).toBe('all')
    expect(result.current.selectedSource).toBe('all')
    expect(result.current.timeGrouping).toBe('day')
    expect(result.current.dateRange).toEqual({
      from: expect.any(Date),
      to: expect.any(Date)
    })
  })

  it('should provide filter methods', () => {
    const { result } = renderHook(() => useDashboardFilters())

    expect(typeof result.current.getAggregationFilters).toBe('function')
    expect(typeof result.current.getChartDataFilters).toBe('function')
    expect(typeof result.current.getExportFilters).toBe('function')
    expect(typeof result.current.getExportFilename).toBe('function')
  })

  it('should provide canExport validation', () => {
    const { result } = renderHook(() => useDashboardFilters())
    expect(typeof result.current.canExport).toBe('boolean')
  })

  describe('Filter methods', () => {
    it('should return correct aggregation filters', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Set specific values to test
      act(() => {
        result.current.setSelectedSeverity(SeverityLevel.ERROR)
        result.current.setSelectedSource('api')
      })
      
      const filters = result.current.getAggregationFilters()
      expect(filters).toBeDefined()
      expect(filters?.severity).toBe(SeverityLevel.ERROR)
      expect(filters?.source).toBe('api')
    })

    it('should return correct chart data filters', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Set specific values to test
      act(() => {
        result.current.setSelectedSeverity(SeverityLevel.WARNING)
        result.current.setSelectedSource('database')
        result.current.setTimeGrouping('hour')
      })
      
      const filters = result.current.getChartDataFilters()
      expect(filters).toBeDefined()
      expect(filters?.severity).toBe(SeverityLevel.WARNING)
      expect(filters?.source).toBe('database')
      expect(filters?.group_by).toBe('hour')
    })

    it('should return null export filters when no valid date range', () => {
      // Create a hook with a manually set invalid date range
      const { result } = renderHook(() => useDashboardFilters())
      
      // Manually set an invalid date range
      act(() => {
        result.current.setDateRange(undefined)
      })
      
      const filters = result.current.getExportFilters()
      expect(filters).toBe(null)
    })

    it('should return correct export filters with valid date range', () => {
      const mockDateRange = createMockDateRange()
      const { result } = renderHook(() => useDashboardFilters({
        dateRange: mockDateRange
      }))
      
      // Set specific values to test
      act(() => {
        result.current.setSelectedSeverity(SeverityLevel.INFO)
        result.current.setSelectedSource('cache')
      })
      
      const filters = result.current.getExportFilters()
      expect(filters).toBeDefined()
      expect(filters?.start_date).toBeDefined()
      expect(filters?.end_date).toBeDefined()
      expect(filters?.severity).toBe(SeverityLevel.INFO)
      expect(filters?.source).toBe('cache')
    })

    it('should exclude "all" values from export filters', () => {
      const mockDateRange = createMockDateRange()
      const { result } = renderHook(() => useDashboardFilters({
        dateRange: mockDateRange
      }))
      
      // Keep default "all" values
      const filters = result.current.getExportFilters()
      expect(filters).toBeDefined()
      expect(filters?.severity).toBeUndefined() // Should be undefined for "all"
      expect(filters?.source).toBeUndefined() // Should be undefined for "all"
    })

    it('should generate correct export filename', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      const filename = result.current.getExportFilename()
      expect(filename).toMatch(/^logs-export-\d{4}-\d{2}-\d{2}\.csv$/)
      expect(filename).toContain('logs-export-')
      expect(filename).toEndWith('.csv')
    })
  })

  describe('canExport validation', () => {
    it('should return true when both from and to dates are present', () => {
      const mockDateRange = createMockDateRange()
      const { result } = renderHook(() => useDashboardFilters({
        dateRange: mockDateRange
      }))
      
      expect(result.current.canExport).toBe(true)
    })

    it('should return false when dateRange is undefined', () => {
      // Create a hook and manually set dateRange to undefined
      const { result } = renderHook(() => useDashboardFilters())
      
      act(() => {
        result.current.setDateRange(undefined)
      })
      
      expect(result.current.canExport).toBe(false)
    })

    it('should return false when from date is missing', () => {
      const { result } = renderHook(() => useDashboardFilters({
        dateRange: { to: new Date() } as { from?: Date; to: Date }
      }))
      
      expect(result.current.canExport).toBe(false)
    })

    it('should return false when to date is missing', () => {
      const { result } = renderHook(() => useDashboardFilters({
        dateRange: { from: new Date() } as { from: Date; to?: Date }
      }))
      
      expect(result.current.canExport).toBe(false)
    })
  })

  describe('State management integration', () => {
    it('should update filters and reflect in computed methods', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Update multiple filters
      act(() => {
        result.current.setSelectedSeverity(SeverityLevel.CRITICAL)
        result.current.setSelectedSource('auth')
        result.current.setTimeGrouping('hour')
      })
      
      // Check aggregation filters
      const aggFilters = result.current.getAggregationFilters()
      expect(aggFilters?.severity).toBe(SeverityLevel.CRITICAL)
      expect(aggFilters?.source).toBe('auth')
      
      // Check chart data filters
      const chartFilters = result.current.getChartDataFilters()
      expect(chartFilters?.severity).toBe(SeverityLevel.CRITICAL)
      expect(chartFilters?.source).toBe('auth')
      expect(chartFilters?.group_by).toBe('hour')
    })

    it('should handle severity filter edge cases', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Test with "all" severity
      act(() => {
        result.current.setSelectedSeverity('all')
      })
      
      const aggFilters = result.current.getAggregationFilters()
      expect(aggFilters?.severity).toBeUndefined()
    })

    it('should handle source filter edge cases', () => {
      const { result } = renderHook(() => useDashboardFilters())
      
      // Test with "all" source
      act(() => {
        result.current.setSelectedSource('all')
      })
      
      const aggFilters = result.current.getAggregationFilters()
      expect(aggFilters?.source).toBeUndefined()
    })
  })
})
