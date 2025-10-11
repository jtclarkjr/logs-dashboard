import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'
import {
  SeverityLevel,
  GroupBy,
  FilterAllOption,
  SeverityFilter,
  SourceFilter
} from '@/lib/types'

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
    toast.info('Filters reset to default')
  }

  // Computed values for API calls
  const getAggregationFilters = () => {
    if (!dateRange?.from || !dateRange?.to) return undefined

    return {
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      severity:
        selectedSeverity === ('all' as FilterAllOption)
          ? undefined
          : (selectedSeverity as SeverityLevel),
      source:
        selectedSource === ('all' as FilterAllOption)
          ? undefined
          : selectedSource
    }
  }

  const getChartDataFilters = () => {
    if (!dateRange?.from || !dateRange?.to) return undefined

    return {
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      severity:
        selectedSeverity === ('all' as FilterAllOption)
          ? undefined
          : (selectedSeverity as SeverityLevel),
      source:
        selectedSource === ('all' as FilterAllOption)
          ? undefined
          : selectedSource,
      group_by: timeGrouping
    }
  }

  const getExportFilters = () => {
    if (!dateRange?.from || !dateRange?.to) return null

    return {
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString(),
      severity:
        selectedSeverity === ('all' as FilterAllOption)
          ? undefined
          : (selectedSeverity as SeverityLevel),
      source:
        selectedSource === ('all' as FilterAllOption)
          ? undefined
          : selectedSource
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
