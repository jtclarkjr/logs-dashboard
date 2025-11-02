import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebouncedValue } from './use-debounced-value'

interface UseDebouncedSearchOptions {
  delay?: number
}

export function useDebouncedSearch(
  initialValue: string,
  onDebouncedChange: (value: string) => void,
  { delay = 300 }: UseDebouncedSearchOptions = {}
) {
  const [searchValue, setSearchValue] = useState(initialValue)
  const debouncedSearchValue = useDebouncedValue(searchValue, { delay })
  const initialValueRef = useRef(initialValue)

  // Update ref when initialValue changes
  useEffect(() => {
    initialValueRef.current = initialValue
  }, [initialValue])

  // Create a setter that tracks whether the change came from user or external
  const handleSetSearchValue = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  // Sync external changes to initialValue
  useEffect(() => {
    // Use a timer to schedule the update, avoiding direct setState in effect
    const timeoutId = setTimeout(() => {
      if (initialValueRef.current !== searchValue) {
        setSearchValue(initialValueRef.current)
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [initialValue, searchValue])

  // Call the callback when debounced value changes
  useEffect(() => {
    onDebouncedChange(debouncedSearchValue)
  }, [debouncedSearchValue, onDebouncedChange])

  return {
    searchValue,
    setSearchValue: handleSetSearchValue
  }
}
