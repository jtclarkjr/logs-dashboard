/// <reference lib="dom" />
import { cleanup } from '@testing-library/react'
import { afterEach } from 'bun:test'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock sonner toast
export const mockToast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {}
}

// Mock react-query
export const createQueryClient = async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      },
      mutations: {
        retry: false
      }
    }
  })
}
