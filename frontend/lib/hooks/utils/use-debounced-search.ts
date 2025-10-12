import { useState, useEffect, useRef } from 'react'
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
  const previousInitialValue = useRef(initialValue)

  // Sync with external changes to initial value (like resets)
  useEffect(() => {
    // Only update if the initial value actually changed (prevents unnecessary updates)
    if (previousInitialValue.current !== initialValue) {
      setSearchValue(initialValue)
      previousInitialValue.current = initialValue
    }
  }, [initialValue])

  // Call the callback when debounced value changes
  useEffect(() => {
    onDebouncedChange(debouncedSearchValue)
  }, [debouncedSearchValue, onDebouncedChange])

  return {
    searchValue,
    setSearchValue
  }
}
