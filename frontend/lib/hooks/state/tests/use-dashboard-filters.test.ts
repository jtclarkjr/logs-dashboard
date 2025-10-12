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
})
