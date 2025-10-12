import { describe, it, expect } from 'bun:test'
import { 
  processSeverityFilter,
  processSourceFilter,
  createBaseDateFilters,
  createAggregationFilters,
  createChartFilters
} from '../filter-helpers'
import { SeverityLevel } from '@/lib/enums/severity'
import type { FilterAllOption, GroupBy } from '@/lib/types/filters'
import { DateRange } from 'react-day-picker'

describe('filter-helpers', () => {
  describe('processSeverityFilter', () => {
    it('should return undefined for "all" severity', () => {
      const result = processSeverityFilter('all' as FilterAllOption)
      expect(result).toBeUndefined()
    })

    it('should return severity level for non-"all" values', () => {
      const result = processSeverityFilter(SeverityLevel.ERROR)
      expect(result).toBe(SeverityLevel.ERROR)
    })

    it('should handle chart mode correctly', () => {
      const result = processSeverityFilter(SeverityLevel.WARNING, true)
      expect(result).toBe(SeverityLevel.WARNING)
    })

    it('should return undefined for "all" in chart mode', () => {
      const result = processSeverityFilter('all' as FilterAllOption, true)
      expect(result).toBeUndefined()
    })

    it('should handle all severity levels', () => {
      const severityLevels = [
        SeverityLevel.DEBUG,
        SeverityLevel.INFO,
        SeverityLevel.WARNING,
        SeverityLevel.ERROR,
        SeverityLevel.CRITICAL
      ]

      severityLevels.forEach(severity => {
        const result = processSeverityFilter(severity)
        expect(result).toBe(severity)
      })
    })
  })

  describe('processSourceFilter', () => {
    it('should return undefined for "all" source', () => {
      const result = processSourceFilter('all' as FilterAllOption)
      expect(result).toBeUndefined()
    })

    it('should return source string for non-"all" values', () => {
      const result = processSourceFilter('web-server')
      expect(result).toBe('web-server')
    })

    it('should handle various source names', () => {
      const sources = ['database', 'api-gateway', 'cache', 'auth-service']
      
      sources.forEach(source => {
        const result = processSourceFilter(source)
        expect(result).toBe(source)
      })
    })

    it('should handle empty string source', () => {
      const result = processSourceFilter('')
      expect(result).toBe('')
    })
  })

  describe('createBaseDateFilters', () => {
    it('should create date filters from valid DateRange', () => {
      const dateRange: DateRange = {
        from: new Date('2024-01-01T00:00:00Z'),
        to: new Date('2024-01-08T00:00:00Z')
      }

      const result = createBaseDateFilters(dateRange)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z'
      })
    })

    it('should return null for undefined DateRange', () => {
      const result = createBaseDateFilters(undefined)
      expect(result).toBeNull()
    })

    it('should return null for DateRange without from date', () => {
      const dateRange: DateRange = {
        to: new Date('2024-01-08T00:00:00Z')
      }

      const result = createBaseDateFilters(dateRange)
      expect(result).toBeNull()
    })

    it('should return null for DateRange without to date', () => {
      const dateRange: DateRange = {
        from: new Date('2024-01-01T00:00:00Z')
      }

      const result = createBaseDateFilters(dateRange)
      expect(result).toBeNull()
    })

    it('should handle same from and to dates', () => {
      const date = new Date('2024-01-01T00:00:00Z')
      const dateRange: DateRange = {
        from: date,
        to: date
      }

      const result = createBaseDateFilters(dateRange)

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-01T00:00:00.000Z'
      })
    })

    it('should handle empty DateRange object', () => {
      const dateRange: DateRange = {}

      const result = createBaseDateFilters(dateRange)
      expect(result).toBeNull()
    })
  })

  describe('createAggregationFilters', () => {
    const validDateRange: DateRange = {
      from: new Date('2024-01-01T00:00:00Z'),
      to: new Date('2024-01-08T00:00:00Z')
    }

    it('should create aggregation filters with all parameters', () => {
      const result = createAggregationFilters(
        validDateRange,
        SeverityLevel.ERROR,
        'web-server'
      )

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z',
        severity: SeverityLevel.ERROR,
        source: 'web-server'
      })
    })

    it('should exclude severity when set to "all"', () => {
      const result = createAggregationFilters(
        validDateRange,
        'all' as FilterAllOption,
        'web-server'
      )

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z',
        source: 'web-server'
      })
    })

    it('should exclude source when set to "all"', () => {
      const result = createAggregationFilters(
        validDateRange,
        SeverityLevel.INFO,
        'all' as FilterAllOption
      )

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z',
        severity: SeverityLevel.INFO
      })
    })

    it('should return undefined for invalid date range', () => {
      const result = createAggregationFilters(
        undefined,
        SeverityLevel.ERROR,
        'web-server'
      )

      expect(result).toBeUndefined()
    })

    it('should create filters with both severity and source as "all"', () => {
      const result = createAggregationFilters(
        validDateRange,
        'all' as FilterAllOption,
        'all' as FilterAllOption
      )

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z'
      })
    })
  })

  describe('createChartFilters', () => {
    const validDateRange: DateRange = {
      from: new Date('2024-01-01T00:00:00Z'),
      to: new Date('2024-01-08T00:00:00Z')
    }
    const groupBy: GroupBy = 'hour'

    it('should create chart filters with all parameters', () => {
      const result = createChartFilters(
        validDateRange,
        SeverityLevel.ERROR,
        'web-server',
        groupBy
      )

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z',
        severity: SeverityLevel.ERROR,
        source: 'web-server',
        group_by: 'hour'
      })
    })

    it('should exclude severity when set to "all"', () => {
      const result = createChartFilters(
        validDateRange,
        'all' as FilterAllOption,
        'web-server',
        'day' as GroupBy
      )

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z',
        source: 'web-server',
        group_by: 'day'
      })
    })

    it('should exclude source when set to "all"', () => {
      const result = createChartFilters(
        validDateRange,
        SeverityLevel.INFO,
        'all' as FilterAllOption,
        'week' as GroupBy
      )

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z',
        severity: SeverityLevel.INFO,
        group_by: 'week'
      })
    })

    it('should return undefined for invalid date range', () => {
      const result = createChartFilters(
        undefined,
        SeverityLevel.ERROR,
        'web-server',
        groupBy
      )

      expect(result).toBeUndefined()
    })

    it('should handle different group_by values', () => {
      const groupByValues: GroupBy[] = ['hour', 'day', 'week', 'month']
      
      groupByValues.forEach(groupBy => {
        const result = createChartFilters(
          validDateRange,
          SeverityLevel.DEBUG,
          'database',
          groupBy
        )

        expect(result?.group_by).toBe(groupBy)
      })
    })

    it('should create filters with both severity and source as "all"', () => {
      const result = createChartFilters(
        validDateRange,
        'all' as FilterAllOption,
        'all' as FilterAllOption,
        'month' as GroupBy
      )

      expect(result).toEqual({
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-08T00:00:00.000Z',
        group_by: 'month'
      })
    })
  })
})
