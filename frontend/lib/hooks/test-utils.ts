import React from 'react'
import { renderHook, RenderHookOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Create a test query client
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: false
      }
    }
  })
}

// React Query Provider wrapper
export const createQueryWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient()

  const QueryWrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client }, children)
  }

  QueryWrapper.displayName = 'QueryWrapper'
  return QueryWrapper
}

// Custom render hook with React Query provider
export const renderHookWithQuery = <TResult, TProps>(
  hook: (initialProps: TProps) => TResult,
  options?: {
    initialProps?: TProps
    queryClient?: QueryClient
  } & Omit<RenderHookOptions<TProps>, 'wrapper'>
) => {
  const { queryClient, ...renderOptions } = options || {}
  const wrapper = createQueryWrapper(queryClient)

  return renderHook(hook, {
    wrapper,
    ...renderOptions
  })
}

// Mock services
export const mockLogsService = {
  getLogs: () =>
    Promise.resolve({
      data: [],
      pagination: {
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0
      }
    }),
  getLogAggregation: () =>
    Promise.resolve({
      total_count: 100,
      severity_counts: { error: 10, warning: 20, info: 70 },
      source_counts: { api: 50, frontend: 30, backend: 20 },
      time_range: {
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-07T23:59:59Z'
      }
    }),
  getChartData: () =>
    Promise.resolve({
      data: [
        { timestamp: '2024-01-01T00:00:00Z', count: 10 },
        { timestamp: '2024-01-02T00:00:00Z', count: 15 }
      ]
    }),
  getLog: () =>
    Promise.resolve({
      id: 1,
      message: 'Test log',
      severity: 'info',
      source: 'api',
      timestamp: '2024-01-01T00:00:00Z',
      metadata: {}
    }),
  createLog: () =>
    Promise.resolve({
      id: 2,
      message: 'New log',
      severity: 'info',
      source: 'api',
      timestamp: '2024-01-01T00:00:00Z',
      metadata: {}
    }),
  updateLog: () =>
    Promise.resolve({
      id: 1,
      message: 'Updated log',
      severity: 'warning',
      source: 'api',
      timestamp: '2024-01-01T00:00:00Z',
      metadata: {}
    }),
  deleteLog: () => Promise.resolve(),
  exportLogs: () =>
    Promise.resolve(new Blob(['csv,data'], { type: 'text/csv' }))
}

export const mockHealthService = {
  getMetadata: () =>
    Promise.resolve({
      version: '1.0.0',
      sources: ['api', 'frontend', 'backend'],
      severity_levels: ['error', 'warning', 'info', 'debug'],
      total_logs: 1000
    })
}

// Mock toast notifications
export const mockToast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {}
}

// Mock the services modules
export const mockServices = () => {
  return {
    logsService: mockLogsService,
    healthService: mockHealthService
  }
}

// Helper to create mock log response
export const createMockLog = (overrides = {}) => ({
  id: 1,
  message: 'Test log message',
  severity: 'info' as const,
  source: 'api',
  timestamp: '2024-01-01T00:00:00Z',
  metadata: {},
  ...overrides
})

// Helper to create mock date range
export const createMockDateRange = () => ({
  from: new Date('2024-01-01'),
  to: new Date('2024-01-07')
})

// Timer utilities for testing debounced hooks
export const advanceTimers = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const flushPromises = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}
