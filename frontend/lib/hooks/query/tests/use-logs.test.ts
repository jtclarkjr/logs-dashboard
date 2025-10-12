import { describe, it, expect } from 'bun:test'
import { QUERY_KEYS } from '@/lib/hooks/query/use-logs'

describe('Query Hooks - Basic Tests', () => {
  it('should have correct query key structure', () => {
    const filters = { page: 1, page_size: 20 }
    const key = QUERY_KEYS.logs(filters)

    expect(key).toEqual(['logs', filters])
  })

  it('should create logs query key', () => {
    const key = QUERY_KEYS.logs({ page: 1, page_size: 20 })
    expect(key[0]).toBe('logs')
    expect(key[1]).toEqual({ page: 1, page_size: 20 })
  })

  it('should create aggregation query key', () => {
    const filters = { start_date: '2024-01-01', end_date: '2024-01-02' }
    const key = QUERY_KEYS.logAggregation(filters)
    expect(key[0]).toBe('log-aggregation')
    expect(key[1]).toEqual(filters)
  })

  it('should create chart data query key', () => {
    const filters = {
      start_date: '2024-01-01',
      end_date: '2024-01-02',
      group_by: 'day' as const
    }
    const key = QUERY_KEYS.chartData(filters)
    expect(key[0]).toBe('chart-data')
    expect(key[1]).toEqual(filters)
  })

  it('should create metadata query key', () => {
    const key = QUERY_KEYS.metadata()
    expect(key).toEqual(['metadata'])
  })

  it('should create single log query key', () => {
    const key = QUERY_KEYS.log(123)
    expect(key).toEqual(['log', 123])
  })
})
