import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'
import type {
  GroupBy,
  FilterAllOption,
  SeverityFilter,
  SourceFilter
} from '@/lib/types/filters'
import {
  createAggregationFilters,
  createChartFilters,
  createBaseDateFilters,
  processSeverityFilter,
  processSourceFilter
} from '@/lib/utils/filter-helpers'

interface DashboardFiltersState {
  dateRange: DateRange | undefined
  selectedSeverity: SeverityFilter
  selectedSource: SourceFilter
  timeGrouping: GroupBy
}

interface InitialDashboardFilters {
  dateRange?: DateRange
  selectedSeverity?: SeverityFilter
  selectedSource?: SourceFilter
  timeGrouping?: GroupBy
}

export function useDashboardFilters(
  initialFilters: InitialDashboardFilters = {}
) {
  // State management
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialFilters.dateRange || {
      from: subDays(new Date(), 7),
      to: new Date()
    }
  )
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>(
    initialFilters.selectedSeverity || ('all' as FilterAllOption)
  )
  const [selectedSource, setSelectedSource] = useState<SourceFilter>(
    initialFilters.selectedSource || ('all' as FilterAllOption)
  )
  const [timeGrouping, setTimeGrouping] = useState<GroupBy>(
    initialFilters.timeGrouping || ('day' as GroupBy)
  )

  const resetFilters = () => {
    setDateRange({
      from: subDays(new Date(), 7),
      to: new Date()
    })
    setSelectedSeverity('all' as FilterAllOption)
    setSelectedSource('all' as FilterAllOption)
    setTimeGrouping('day' as GroupBy)
  }

  // Computed values for API calls using utility functions
  const getAggregationFilters = () => {
    return createAggregationFilters(dateRange, selectedSeverity, selectedSource)
  }

  const getChartDataFilters = () => {
    return createChartFilters(
      dateRange,
      selectedSeverity,
      selectedSource,
      timeGrouping
    )
  }

  const getExportFilters = () => {
    const baseDateFilters = createBaseDateFilters(dateRange)
    if (!baseDateFilters) return null

    return {
      ...baseDateFilters,
      severity: processSeverityFilter(selectedSeverity, true),
      source: processSourceFilter(selectedSource)
    }
  }

  const getExportFilename = () => {
    return `logs-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
  }

  // Return state and actions
  return {
    // State
    dateRange,
    selectedSeverity,
    selectedSource,
    timeGrouping,

    // Actions
    setDateRange,
    setSelectedSeverity,
    setSelectedSource,
    setTimeGrouping,
    resetFilters,

    // Computed helpers
    getAggregationFilters,
    getChartDataFilters,
    getExportFilters,
    getExportFilename,

    // Validation
    canExport: Boolean(dateRange?.from && dateRange?.to)
  }
}

export type { DashboardFiltersState, InitialDashboardFilters }
