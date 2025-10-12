/// <reference lib="dom" />
import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { renderHook } from '@testing-library/react'
import { useIsMobile } from '@/lib/hooks/utils/use-mobile'

// Simple helper to set window width and trigger resize
const setWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })
}

interface MockMediaQueryList {
  matches: boolean
  media: string
  addEventListener: () => void
  removeEventListener: () => void
  onchange: null
  addListener: () => void
  removeListener: () => void
  dispatchEvent: () => boolean
}

describe('useIsMobile', () => {
  let originalMatchMedia: typeof window.matchMedia
  let mockMatchMedia: (query: string) => MockMediaQueryList
  let mockMediaQueryList: MockMediaQueryList
  let lastCalledQuery: string | null = null

  beforeEach(() => {
    // Store original matchMedia
    originalMatchMedia = window.matchMedia
    lastCalledQuery = null

    // Create mock MediaQueryList
    mockMediaQueryList = {
      matches: false,
      media: '',
      addEventListener: () => {},
      removeEventListener: () => {},
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true
    }

    // Mock matchMedia
    mockMatchMedia = (query: string) => {
      lastCalledQuery = query
      const result = { ...mockMediaQueryList }
      result.media = query
      result.matches = window.innerWidth < 768
      return result
    }

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mockMatchMedia
    })

    // Set default desktop width
    setWindowWidth(1024)
  })

  afterEach(() => {
    // Restore original matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia
    })
  })

  it('should return false for desktop width (>= 768px)', () => {
    setWindowWidth(1024)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true for mobile width (< 768px)', () => {
    setWindowWidth(600)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should return false for exactly 768px width', () => {
    setWindowWidth(768)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true for exactly 767px width', () => {
    setWindowWidth(767)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should use correct breakpoint query', () => {
    renderHook(() => useIsMobile())
    expect(lastCalledQuery).toBe('(max-width: 767px)')
  })

  it('should handle multiple instances', () => {
    const { result: result1 } = renderHook(() => useIsMobile())
    const { result: result2 } = renderHook(() => useIsMobile())
    expect(result1.current).toBe(result2.current)
  })

  it('should return boolean value', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe('boolean')
  })
})
