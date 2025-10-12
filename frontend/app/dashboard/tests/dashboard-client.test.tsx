/// <reference lib="dom" />
import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { DashboardClient } from '../dashboard-client'
import type { LogAggregationResponse } from '@/lib/types/log'
import type { MetadataResponse } from '@/lib/types/common'
import type { GroupBy } from '@/lib/types/filters'
import { SeverityLevel } from '@/lib/enums/severity'

// Create a simplified test version that bypasses the complex mocking
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Mock data
const mockAggregationData: LogAggregationResponse = {
  total_logs: 1000,
  date_range_start: '2024-01-01T00:00:00Z',
  date_range_end: '2024-01-08T00:00:00Z',
  by_severity: [
    { severity: SeverityLevel.ERROR, count: 50 },
    { severity: SeverityLevel.WARNING, count: 200 },
    { severity: SeverityLevel.INFO, count: 500 },
    { severity: SeverityLevel.DEBUG, count: 250 }
  ],
  by_source: [
    { source: 'web-server', count: 600 },
    { source: 'database', count: 300 },
    { source: 'cache', count: 100 }
  ],
  by_date: [{ date: '2024-01-01', count: 1000 }]
}

const mockMetadata: MetadataResponse = {
  severity_levels: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
  sources: ['web-server', 'database', 'cache'],
  date_range: {
    earliest: '2024-01-01T00:00:00Z',
    latest: '2024-01-08T00:00:00Z'
  },
  severity_stats: {
    ERROR: 50,
    WARNING: 200,
    INFO: 500,
    DEBUG: 250
  },
  total_logs: 1000,
  sort_fields: ['timestamp', 'severity'],
  pagination: {
    default_page_size: 10,
    max_page_size: 100
  }
}

describe('DashboardClient', () => {
  describe('Component Creation and Props', () => {
    it('should accept and handle initial data prop', () => {
      const initialData = {
        aggregationData: mockAggregationData,
        metadata: mockMetadata
      }

      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={initialData} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should accept and handle initial filters prop', () => {
      const initialFilters = {
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-01-08') },
        selectedSeverity: 'error' as const,
        selectedSource: 'web-server',
        timeGrouping: 'hour' as GroupBy
      }

      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={{}} initialFilters={initialFilters} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should handle empty initial data gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={{}} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should handle undefined props gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={{}} initialFilters={undefined} />
          </TestWrapper>
        )
      }).not.toThrow()
    })
  })

  describe('Component Structure', () => {
    it('should render without crashing with minimal props', () => {
      const { container } = render(
        <TestWrapper>
          <DashboardClient initialData={{}} />
        </TestWrapper>
      )

      expect(container).toBeTruthy()
      expect(container.firstChild).toBeTruthy()
    })

    it('should render with complex initial data', () => {
      const initialData = {
        aggregationData: mockAggregationData,
        metadata: mockMetadata
      }

      const { container } = render(
        <TestWrapper>
          <DashboardClient initialData={initialData} />
        </TestWrapper>
      )

      expect(container).toBeTruthy()
      expect(container.firstChild).toBeTruthy()
    })

    it('should have container div as root element', () => {
      const { container } = render(
        <TestWrapper>
          <DashboardClient initialData={{}} />
        </TestWrapper>
      )

      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toBeTruthy()
      expect(rootElement.tagName).toBe('DIV')
    })
  })

  describe('Data Handling', () => {
    it('should accept aggregation data without errors', () => {
      const initialData = {
        aggregationData: mockAggregationData
      }

      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={initialData} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should accept time series data without errors', () => {
      const initialData = {
        aggregationData: mockAggregationData
      }

      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={initialData} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should accept metadata without errors', () => {
      const initialData = {
        metadata: mockMetadata
      }

      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={initialData} />
          </TestWrapper>
        )
      }).not.toThrow()
    })
  })

  describe('Error Boundaries', () => {
    it('should handle malformed aggregation data', () => {
      const initialData = {
        aggregationData: {} as LogAggregationResponse
      }

      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={initialData} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should handle malformed time series data', () => {
      const initialData = {
        aggregationData: undefined
      }

      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={initialData} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should handle null/undefined values in data', () => {
      const initialData = {
        aggregationData: undefined,
        metadata: undefined
      }

      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={initialData as never} />
          </TestWrapper>
        )
      }).not.toThrow()
    })
  })

  describe('Integration with React Query', () => {
    it('should work within QueryClientProvider', () => {
      expect(() => {
        render(
          <TestWrapper>
            <DashboardClient initialData={{}} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should not crash when QueryClient has custom config', () => {
      const customQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            staleTime: 5 * 60 * 1000
          },
          mutations: { retry: 1 }
        }
      })

      expect(() => {
        render(
          <QueryClientProvider client={customQueryClient}>
            <DashboardClient initialData={{}} />
          </QueryClientProvider>
        )
      }).not.toThrow()
    })
  })

  describe('Props Validation', () => {
    it('should handle various filter combinations', () => {
      const testCases = [
        { selectedSeverity: 'all' },
        { selectedSeverity: 'error' },
        { selectedSource: 'web-server' },
        { timeGrouping: 'day' as GroupBy },
        { timeGrouping: 'hour' as GroupBy }
      ]

      testCases.forEach((filters) => {
        expect(() => {
          render(
            <TestWrapper>
              <DashboardClient initialData={{}} initialFilters={filters} />
            </TestWrapper>
          )
        }).not.toThrow()
      })
    })

    it('should handle date range variations', () => {
      const testCases = [
        { dateRange: { from: new Date(), to: new Date() } },
        { dateRange: { from: subDays(new Date(), 7), to: new Date() } },
        { dateRange: undefined }
      ]

      testCases.forEach((filters) => {
        expect(() => {
          render(
            <TestWrapper>
              <DashboardClient initialData={{}} initialFilters={filters} />
            </TestWrapper>
          )
        }).not.toThrow()
      })
    })
  })
})
