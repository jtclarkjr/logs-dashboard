import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { SeverityLevel } from '@/lib/enums/severity'
import type {
  SortOrder,
  FilterAllOption,
  SeverityFilter,
  SourceFilter,
  SortByField
} from '@/lib/types/filters'

interface LogsFiltersState {
  searchQuery: string
  selectedSeverity: SeverityFilter
  selectedSource: SourceFilter
  sortBy: SortByField
  sortOrder: SortOrder
  currentPage: number
  pageSize: number
  dateRange: DateRange | undefined
}

interface InitialLogsFilters {
  searchQuery?: string
  selectedSeverity?: SeverityFilter
  selectedSource?: SourceFilter
  sortBy?: SortByField
  sortOrder?: SortOrder
  currentPage?: number
  dateRange?: DateRange
}

export function useLogsFilters(initialFilters: InitialLogsFilters = {}) {
  // State management
  const [searchQuery, setSearchQuery] = useState(
    initialFilters.searchQuery || ''
  )
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>(
    initialFilters.selectedSeverity || ('all' as FilterAllOption)
  )
  const [selectedSource, setSelectedSource] = useState<SourceFilter>(
    initialFilters.selectedSource || ('all' as FilterAllOption)
  )
  const [sortBy, setSortBy] = useState<SortByField>(
    initialFilters.sortBy || ('timestamp' as SortByField)
  )
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    initialFilters.sortOrder || 'desc'
  )
  const [currentPage, setCurrentPage] = useState(
    initialFilters.currentPage || 1
  )
  const [pageSize] = useState(15) // Fixed page size
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialFilters.dateRange
  )

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedSeverity('all' as FilterAllOption)
    setSelectedSource('all' as FilterAllOption)
    setSortBy('timestamp' as SortByField)
    setSortOrder('desc' as SortOrder)
    setCurrentPage(1)
    setDateRange(undefined)
    toast.info('Filters reset')
  }

  // Handle page changes with reset to page 1 when filters change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleFilterChange = (filterSetter: () => void) => {
    filterSetter()
    setCurrentPage(1) // Reset to first page when any filter changes
  }

  // Safe filter setters that reset pagination
  const setSearchQueryWithReset = (query: string) => {
    handleFilterChange(() => setSearchQuery(query))
  }

  const setSelectedSeverityWithReset = (severity: SeverityFilter) => {
    handleFilterChange(() => setSelectedSeverity(severity))
  }

  const setSelectedSourceWithReset = (source: SourceFilter) => {
    handleFilterChange(() => setSelectedSource(source))
  }

  const setDateRangeWithReset = (range: DateRange | undefined) => {
    handleFilterChange(() => setDateRange(range))
  }

  const handleSortChange = (field: SortByField, order: SortOrder) => {
    setSortBy(field)
    setSortOrder(order)
    setCurrentPage(1) // Reset pagination on sort change
  }

  // Generate API filters object
  const getAPIFilters = () => {
    return {
      page: currentPage,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
      ...(searchQuery && { search: searchQuery }),
      ...(selectedSeverity !== ('all' as FilterAllOption) && {
        severity: selectedSeverity as SeverityLevel
      }),
      ...(selectedSource !== ('all' as FilterAllOption) && {
        source: selectedSource
      }),
      ...(dateRange?.from && { start_date: dateRange.from.toISOString() }),
      ...(dateRange?.to && { end_date: dateRange.to.toISOString() })
    }
  }

  // Return state and actions
  return {
    // State
    searchQuery,
    selectedSeverity,
    selectedSource,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    dateRange,

    // Basic actions (use these for direct UI updates)
    setSearchQuery: setSearchQueryWithReset,
    setSelectedSeverity: setSelectedSeverityWithReset,
    setSelectedSource: setSelectedSourceWithReset,
    setDateRange: setDateRangeWithReset,
    setSortBy,
    setSortOrder,
    setCurrentPage: handlePageChange,

    // Compound actions
    handleSortChange,
    resetFilters,

    // Computed helpers
    getAPIFilters,

    // Derived state
    hasActiveFilters: Boolean(
      searchQuery ||
        selectedSeverity !== ('all' as FilterAllOption) ||
        selectedSource !== ('all' as FilterAllOption) ||
        dateRange?.from ||
        dateRange?.to
    )
  }
}

export type { LogsFiltersState, InitialLogsFilters }
