/// <reference lib="dom" />
import { describe, it, expect } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from '@/lib/hooks/utils/use-debounced-value'

// Helper to advance time in tests
const advanceTime = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe('useDebouncedValue', () => {
  it('should initialize with the initial value', () => {
    const { result } = renderHook(() => useDebouncedValue('initial'))

    expect(result.current).toBe('initial')
  })

  it('should return initial value immediately for empty/falsy values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, { delay: 500 }),
      { initialProps: { value: 'test' } }
    )

    expect(result.current).toBe('test')

    // Change to empty value
    act(() => {
      rerender({ value: '' })
    })

    // Should update immediately without waiting for delay
    expect(result.current).toBe('')
  })

  it('should debounce non-empty values with default delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    // Change value
    act(() => {
      rerender({ value: 'changed' })
    })

    // Should still show initial value immediately
    expect(result.current).toBe('initial')

    // Wait for default delay (300ms)
    await act(async () => {
      await advanceTime(350)
    })

    // Should now show the changed value
    expect(result.current).toBe('changed')
  })

  it('should use custom delay when provided', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, { delay: 100 }),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    act(() => {
      rerender({ value: 'changed' })
    })

    expect(result.current).toBe('initial')

    // Wait for custom delay (100ms) with larger buffer for Docker timing
    await act(async () => {
      await advanceTime(250)
    })

    expect(result.current).toBe('changed')
  })

  it('should handle rapid value changes by canceling previous timer', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, { delay: 200 }),
      { initialProps: { value: 'initial' } }
    )

    // First change
    act(() => {
      rerender({ value: 'first' })
    })

    // Wait a bit but not full delay
    await act(async () => {
      await advanceTime(100)
    })

    // Should still show initial
    expect(result.current).toBe('initial')

    // Second change before first completes
    act(() => {
      rerender({ value: 'second' })
    })

    // Wait another bit but still not full delay from second change
    await act(async () => {
      await advanceTime(100)
    })

    // Should still show initial (first timer was cancelled)
    expect(result.current).toBe('initial')

    // Wait for full delay from second change
    await act(async () => {
      await advanceTime(150)
    })

    // Should show the second value, not the first
    expect(result.current).toBe('second')
  })

  it('should work with different data types', async () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebouncedValue(value, { delay: 100 }),
      { initialProps: { value: 42 } }
    )

    expect(numberResult.current).toBe(42)

    act(() => {
      numberRerender({ value: 100 })
    })

    await act(async () => {
      await advanceTime(150)
    })

    expect(numberResult.current).toBe(100)

    // Test with boolean
    const { result: boolResult, rerender: boolRerender } = renderHook(
      ({ value }) => useDebouncedValue(value, { delay: 100 }),
      { initialProps: { value: true } }
    )

    expect(boolResult.current).toBe(true)

    act(() => {
      boolRerender({ value: false })
    })

    // False is falsy, should update immediately
    expect(boolResult.current).toBe(false)

    // Test with object
    const initialObj = { id: 1, name: 'test' }
    const changedObj = { id: 2, name: 'changed' }

    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useDebouncedValue(value, { delay: 100 }),
      { initialProps: { value: initialObj } }
    )

    expect(objResult.current).toEqual(initialObj)

    act(() => {
      objRerender({ value: changedObj })
    })

    await act(async () => {
      await advanceTime(150)
    })

    expect(objResult.current).toEqual(changedObj)
  })

  it('should handle null and undefined values immediately', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null | undefined }) =>
        useDebouncedValue(value, { delay: 500 }),
      { initialProps: { value: 'test' as string | null | undefined } }
    )

    // Change to null
    act(() => {
      rerender({ value: null })
    })

    expect(result.current).toBe(null)

    // Change to undefined
    act(() => {
      rerender({ value: undefined })
    })

    expect(result.current).toBe(undefined)
  })

  it('should handle zero delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, { delay: 0 }),
      { initialProps: { value: 'initial' } }
    )

    act(() => {
      rerender({ value: 'changed' })
    })

    // Even with 0 delay, should still be async
    expect(result.current).toBe('initial')

    await act(async () => {
      await advanceTime(10)
    })

    expect(result.current).toBe('changed')
  })
})
