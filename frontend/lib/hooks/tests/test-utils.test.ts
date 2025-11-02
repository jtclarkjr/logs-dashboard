import { describe, it, expect } from 'bun:test'
import {
  createTestQueryClient,
  createQueryWrapper,
  renderHookWithQuery,
  mockLogsService,
  mockHealthService,
  mockToast,
  mockServices,
  createMockLog,
  createMockDateRange,
  advanceTimers,
  flushPromises
} from '../test-utils'
import { QueryClient } from '@tanstack/react-query'
import { useState } from 'react'

describe('test-utils', () => {
  describe('createTestQueryClient', () => {
    it('should create a QueryClient with test configuration', () => {
      const queryClient = createTestQueryClient()

      expect(queryClient).toBeInstanceOf(QueryClient)
      expect(queryClient.getDefaultOptions().queries?.retry).toBe(false)
      expect(
        queryClient.getDefaultOptions().queries?.refetchOnWindowFocus
      ).toBe(false)
      expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false)
    })
  })

  describe('createQueryWrapper', () => {
    it('should create a wrapper component without custom client', () => {
      const Wrapper = createQueryWrapper()

      expect(Wrapper).toBeDefined()
      expect(Wrapper.displayName).toBe('QueryWrapper')
    })

    it('should create a wrapper component with custom client', () => {
      const customClient = createTestQueryClient()
      const Wrapper = createQueryWrapper(customClient)

      expect(Wrapper).toBeDefined()
      expect(Wrapper.displayName).toBe('QueryWrapper')
    })
  })

  describe('renderHookWithQuery', () => {
    it('should render hook with query wrapper', () => {
      const useTestHook = () => useState(0)

      const { result } = renderHookWithQuery(useTestHook)

      expect(result.current[0]).toBe(0)
    })

    it('should render hook with custom query client', () => {
      const customClient = createTestQueryClient()
      const useTestHook = () => useState('test')

      const { result } = renderHookWithQuery(useTestHook, {
        queryClient: customClient
      })

      expect(result.current[0]).toBe('test')
    })

    it('should render hook with initial props', () => {
      const useTestHook = (initialValue: number) => useState(initialValue)

      const { result } = renderHookWithQuery(useTestHook, {
        initialProps: 42
      })

      expect(result.current[0]).toBe(42)
    })
  })

  describe('mock services', () => {
    describe('mockLogsService', () => {
      it('should provide getLogs method', async () => {
        const result = await mockLogsService.getLogs()

        expect(result).toEqual({
          data: [],
          pagination: {
            page: 1,
            page_size: 20,
            total: 0,
            total_pages: 0
          }
        })
      })

      it('should provide getLogAggregation method', async () => {
        const result = await mockLogsService.getLogAggregation()

        expect(result).toEqual({
          total_count: 100,
          severity_counts: { error: 10, warning: 20, info: 70 },
          source_counts: { api: 50, frontend: 30, backend: 20 },
          time_range: {
            start_date: '2024-01-01T00:00:00Z',
            end_date: '2024-01-07T23:59:59Z'
          }
        })
      })

      it('should provide getChartData method', async () => {
        const result = await mockLogsService.getChartData()

        expect(result).toEqual({
          data: [
            { timestamp: '2024-01-01T00:00:00Z', count: 10 },
            { timestamp: '2024-01-02T00:00:00Z', count: 15 }
          ]
        })
      })

      it('should provide getLog method', async () => {
        const result = await mockLogsService.getLog()

        expect(result).toEqual({
          id: 1,
          message: 'Test log',
          severity: 'info',
          source: 'api',
          timestamp: '2024-01-01T00:00:00Z',
          metadata: {}
        })
      })

      it('should provide createLog method', async () => {
        const result = await mockLogsService.createLog()

        expect(result).toEqual({
          id: 2,
          message: 'New log',
          severity: 'info',
          source: 'api',
          timestamp: '2024-01-01T00:00:00Z',
          metadata: {}
        })
      })

      it('should provide updateLog method', async () => {
        const result = await mockLogsService.updateLog()

        expect(result).toEqual({
          id: 1,
          message: 'Updated log',
          severity: 'warning',
          source: 'api',
          timestamp: '2024-01-01T00:00:00Z',
          metadata: {}
        })
      })

      it('should provide deleteLog method', async () => {
        const result = await mockLogsService.deleteLog()

        expect(result).toBeUndefined()
      })

      it('should provide exportLogs method', async () => {
        const result = await mockLogsService.exportLogs()

        expect(result).toBeInstanceOf(Blob)
        expect(result.type).toBe('text/csv')
      })
    })

    describe('mockHealthService', () => {
      it('should provide getMetadata method', async () => {
        const result = await mockHealthService.getMetadata()

        expect(result).toEqual({
          version: '1.0.0',
          sources: ['api', 'frontend', 'backend'],
          severity_levels: ['error', 'warning', 'info', 'debug'],
          total_logs: 1000
        })
      })
    })

    describe('mockToast', () => {
      it('should provide toast methods', () => {
        expect(typeof mockToast.success).toBe('function')
        expect(typeof mockToast.error).toBe('function')
        expect(typeof mockToast.info).toBe('function')
        expect(typeof mockToast.warning).toBe('function')

        // Should not throw when called
        mockToast.success()
        mockToast.error()
        mockToast.info()
        mockToast.warning()
      })
    })

    describe('mockServices', () => {
      it('should return both services', () => {
        const services = mockServices()

        expect(services.logsService).toBe(mockLogsService)
        expect(services.healthService).toBe(mockHealthService)
      })
    })
  })

  describe('helper functions', () => {
    describe('createMockLog', () => {
      it('should create mock log with defaults', () => {
        const log = createMockLog()

        expect(log).toEqual({
          id: 1,
          message: 'Test log message',
          severity: 'info',
          source: 'api',
          timestamp: '2024-01-01T00:00:00Z',
          metadata: {}
        })
      })

      it('should create mock log with overrides', () => {
        const log = createMockLog({
          id: 999,
          message: 'Custom message',
          severity: 'error'
        })

        expect(log).toEqual({
          id: 999,
          message: 'Custom message',
          severity: 'error',
          source: 'api',
          timestamp: '2024-01-01T00:00:00Z',
          metadata: {}
        })
      })
    })

    describe('createMockDateRange', () => {
      it('should create mock date range', () => {
        const dateRange = createMockDateRange()

        expect(dateRange.from).toEqual(new Date('2024-01-01'))
        expect(dateRange.to).toEqual(new Date('2024-01-07'))
      })
    })

    describe('timer utilities', () => {
      it('should provide advanceTimers function', async () => {
        const start = Date.now()
        await advanceTimers(100)
        const end = Date.now()

        expect(end - start).toBeGreaterThanOrEqual(100)
      })

      it('should provide flushPromises function', async () => {
        let resolved = false
        Promise.resolve().then(() => {
          resolved = true
        })

        expect(resolved).toBe(false)
        await flushPromises()
        expect(resolved).toBe(true)
      })
    })
  })
})
