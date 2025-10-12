import { SeverityLevel } from '@/lib/enums/severity'
import type {
  FilterAllOption,
  SeverityFilter,
  SourceFilter,
  LogAggregationFilters,
  ChartFilters,
  GroupBy,
  DateFilters
} from '@/lib/types/filters'
import { DateRange } from 'react-day-picker'

/**
 * Converts 'all' severity filter to undefined, otherwise returns the severity
 */
export const processSeverityFilter = (
  selectedSeverity: SeverityFilter,
  forChart = false
): SeverityLevel | undefined => {
  const isAllSelected = selectedSeverity === ('all' as FilterAllOption)
  if (isAllSelected) return undefined
  return forChart ? (selectedSeverity as SeverityLevel) : selectedSeverity
}

/**
 * Converts 'all' source filter to undefined, otherwise returns the source
 */
export const processSourceFilter = (
  selectedSource: SourceFilter
): string | undefined => {
  const isAllSelected = selectedSource === ('all' as FilterAllOption)
  return isAllSelected ? undefined : selectedSource
}

/**
 * Creates base date filters from DateRange
 */
export const createBaseDateFilters = (
  dateRange?: DateRange
): DateFilters | null => {
  if (!dateRange?.from || !dateRange?.to) return null

  return {
    start_date: dateRange.from.toISOString(),
    end_date: dateRange.to.toISOString()
  }
}

/**
 * Creates aggregation filters with proper type handling
 */
export const createAggregationFilters = (
  dateRange: DateRange | undefined,
  selectedSeverity: SeverityFilter,
  selectedSource: SourceFilter
): LogAggregationFilters | undefined => {
  const baseDateFilters = createBaseDateFilters(dateRange)
  if (!baseDateFilters) return undefined

  return {
    ...baseDateFilters,
    severity: processSeverityFilter(selectedSeverity),
    source: processSourceFilter(selectedSource)
  }
}

/**
 * Creates chart filters with proper type handling and group_by
 */
export const createChartFilters = (
  dateRange: DateRange | undefined,
  selectedSeverity: SeverityFilter,
  selectedSource: SourceFilter,
  groupBy: GroupBy
): ChartFilters | undefined => {
  const baseDateFilters = createBaseDateFilters(dateRange)
  if (!baseDateFilters) return undefined

  return {
    ...baseDateFilters,
    severity: processSeverityFilter(selectedSeverity, true),
    source: processSourceFilter(selectedSource),
    group_by: groupBy
  }
}
