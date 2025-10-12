/// <reference lib="dom" />
import { describe, it, expect } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useLogsFilters } from '@/lib/hooks/state/use-logs-filters'
import { createMockDateRange } from '@/lib/hooks/test-utils'
import { SeverityLevel } from '@/lib/enums/severity'

describe('useLogsFilters', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLogsFilters())

    expect(result.current.searchQuery).toBe('')
    expect(result.current.selectedSeverity).toBe('all')
    expect(result.current.selectedSource).toBe('all')
    expect(result.current.sortBy).toBe('timestamp')
    expect(result.current.sortOrder).toBe('desc')
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(10)
    expect(result.current.dateRange).toBeUndefined()
  })

  it('should update search query', () => {
    const { result } = renderHook(() => useLogsFilters())

    act(() => {
      result.current.setSearchQuery('test search')
    })

    expect(result.current.searchQuery).toBe('test search')
  })

  it('should update severity filter', () => {
    const { result } = renderHook(() => useLogsFilters())

    act(() => {
      result.current.setSelectedSeverity(SeverityLevel.ERROR)
    })

    expect(result.current.selectedSeverity).toBe(SeverityLevel.ERROR)
  })

  it('should update source filter', () => {
    const { result } = renderHook(() => useLogsFilters())

    act(() => {
      result.current.setSelectedSource('api')
    })

    expect(result.current.selectedSource).toBe('api')
  })

  it('should update date range', () => {
    const { result } = renderHook(() => useLogsFilters())
    const dateRange = createMockDateRange()

    act(() => {
      result.current.setDateRange(dateRange)
    })

    expect(result.current.dateRange).toEqual(dateRange)
  })

  it('should update sort parameters', () => {
    const { result } = renderHook(() => useLogsFilters())

    act(() => {
      result.current.setSortBy('severity')
      result.current.setSortOrder('asc')
    })

    expect(result.current.sortBy).toBe('severity')
    expect(result.current.sortOrder).toBe('asc')
  })

  it('should update pagination', () => {
    const { result } = renderHook(() => useLogsFilters())

    act(() => {
      result.current.setCurrentPage(3)
    })
    expect(result.current.currentPage).toBe(3)

    act(() => {
      result.current.setPageSize(50)
    })

    // Page size should change, and current page should reset to 1
    expect(result.current.currentPage).toBe(1)
    expect(result.current.pageSize).toBe(50)
  })

  it('should reset filters', () => {
    const { result } = renderHook(() => useLogsFilters())

    // Set some values
    act(() => {
      result.current.setSearchQuery('test')
      result.current.setSelectedSeverity(SeverityLevel.ERROR)
      result.current.setCurrentPage(5)
    })

    // Reset
    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.searchQuery).toBe('')
    expect(result.current.selectedSeverity).toBe('all')
    expect(result.current.currentPage).toBe(1)
  })

  it('should provide API filters object', () => {
    const { result } = renderHook(() => useLogsFilters())

    const apiFilters = result.current.getAPIFilters()
    expect(typeof apiFilters).toBe('object')
    expect(apiFilters.page).toBe(1)
    expect(apiFilters.page_size).toBe(10)
  })

  it('should compute hasActiveFilters correctly', () => {
    const { result } = renderHook(() => useLogsFilters())

    expect(result.current.hasActiveFilters).toBe(false)

    act(() => {
      result.current.setSearchQuery('test')
    })

    expect(result.current.hasActiveFilters).toBe(true)
  })
})
