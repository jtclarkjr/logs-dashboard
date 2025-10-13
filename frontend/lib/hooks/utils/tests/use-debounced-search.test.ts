/// <reference lib="dom" />
import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedSearch } from '@/lib/hooks/utils/use-debounced-search'

// Helper to advance time in tests
const advanceTime = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe('useDebouncedSearch', () => {
  let mockCallback: ReturnType<typeof mock>

  beforeEach(() => {
    mockCallback = mock()
  })

  it('should initialize with initial value and call callback immediately', () => {
    const { result } = renderHook(() =>
      useDebouncedSearch('initial', mockCallback)
    )

    expect(result.current.searchValue).toBe('initial')
    expect(mockCallback).toHaveBeenCalledWith('initial')
  })

  it('should update search value immediately but debounce callback', async () => {
    const { result } = renderHook(() =>
      useDebouncedSearch('', mockCallback, { delay: 200 })
    )

    // Clear initial call
    mockCallback.mockClear()

    // Update search value
    act(() => {
      result.current.setSearchValue('test')
    })

    // Search value should update immediately
    expect(result.current.searchValue).toBe('test')

    // Callback should not have been called yet
    expect(mockCallback).not.toHaveBeenCalled()

    // Wait for debounce delay with buffer for Docker timing
    await act(async () => {
      await advanceTime(300)
    })

    // Now callback should be called with debounced value
    expect(mockCallback).toHaveBeenCalledWith('test')
  })

  it('should use default delay of 300ms', async () => {
    const { result } = renderHook(() => useDebouncedSearch('', mockCallback))

    mockCallback.mockClear()

    act(() => {
      result.current.setSearchValue('test')
    })

    // Wait less than default delay
    await act(async () => {
      await advanceTime(250)
    })

    expect(mockCallback).not.toHaveBeenCalled()

    // Wait for full default delay with buffer for Docker timing
    await act(async () => {
      await advanceTime(150)
    })

    expect(mockCallback).toHaveBeenCalledWith('test')
  })

  it('should cancel previous debounced call when value changes quickly', async () => {
    const { result } = renderHook(() =>
      useDebouncedSearch('', mockCallback, { delay: 200 })
    )

    mockCallback.mockClear()

    // First change
    act(() => {
      result.current.setSearchValue('first')
    })

    // Wait partway through delay
    await act(async () => {
      await advanceTime(100)
    })

    // Second change before first completes
    act(() => {
      result.current.setSearchValue('second')
    })

    // Wait for second delay to complete with buffer for Docker timing
    await act(async () => {
      await advanceTime(300)
    })

    // Should only have been called with the second value
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('second')
  })

  it('should sync with external initial value changes', async () => {
    const { result, rerender } = renderHook(
      ({ initialValue }) => useDebouncedSearch(initialValue, mockCallback),
      { initialProps: { initialValue: 'first' } }
    )

    expect(result.current.searchValue).toBe('first')

    // Clear the initial callback
    mockCallback.mockClear()

    // Change initial value externally (like a reset)
    rerender({ initialValue: 'reset' })

    expect(result.current.searchValue).toBe('reset')

    // The callback should be triggered with the new value after debounce with buffer for Docker timing
    await act(async () => {
      await advanceTime(400)
    })

    expect(mockCallback).toHaveBeenCalledWith('reset')
  })

  it('should not sync if initial value hasnt actually changed', () => {
    const { result, rerender } = renderHook(
      ({ initialValue }) => useDebouncedSearch(initialValue, mockCallback),
      { initialProps: { initialValue: 'same' } }
    )

    mockCallback.mockClear()

    // User changes value
    act(() => {
      result.current.setSearchValue('user input')
    })

    expect(result.current.searchValue).toBe('user input')

    // Re-render with same initial value (shouldn't override user input)
    rerender({ initialValue: 'same' })

    expect(result.current.searchValue).toBe('user input')
    expect(mockCallback).not.toHaveBeenCalled()
  })

  it('should handle empty string values correctly', async () => {
    const { result } = renderHook(() =>
      useDebouncedSearch('initial', mockCallback, { delay: 100 })
    )

    mockCallback.mockClear()

    // Set to empty string
    act(() => {
      result.current.setSearchValue('')
    })

    expect(result.current.searchValue).toBe('')

    // Wait for debounce - empty values should still be debounced through useDebouncedValue with buffer for Docker timing
    await act(async () => {
      await advanceTime(200)
    })

    expect(mockCallback).toHaveBeenCalledWith('')
  })

  it('should handle rapid typing scenario', async () => {
    const { result } = renderHook(() =>
      useDebouncedSearch('', mockCallback, { delay: 300 })
    )

    mockCallback.mockClear()

    // Simulate rapid typing
    const typingSequence = ['s', 'se', 'sea', 'sear', 'searc', 'search']

    typingSequence.forEach((value) => {
      act(() => {
        result.current.setSearchValue(value)
      })

      // Expect immediate UI update
      expect(result.current.searchValue).toBe(value)
    })

    // Only final value should trigger callback after delay
    expect(mockCallback).not.toHaveBeenCalled()

    await act(async () => {
      await advanceTime(400)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('search')
  })

  it('should work with callback reference changes', async () => {
    const callback1 = mock()
    const callback2 = mock()

    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedSearch('', cb, { delay: 100 }),
      { initialProps: { cb: callback1 } }
    )

    // Clear initial call
    callback1.mockClear()

    act(() => {
      result.current.setSearchValue('test')
    })

    // Change callback before debounce completes
    rerender({ cb: callback2 })

    await act(async () => {
      await advanceTime(200)
    })

    // Should call the new callback
    expect(callback2).toHaveBeenCalledWith('test')
    expect(callback1).not.toHaveBeenCalled()
  })

  it('should handle custom delay options', async () => {
    const { result } = renderHook(() =>
      useDebouncedSearch('', mockCallback, { delay: 50 })
    )

    mockCallback.mockClear()

    act(() => {
      result.current.setSearchValue('fast')
    })

    // Wait for shorter delay with buffer for Docker timing
    await act(async () => {
      await advanceTime(120)
    })

    expect(mockCallback).toHaveBeenCalledWith('fast')
  })
})
