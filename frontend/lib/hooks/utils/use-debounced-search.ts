import { useState, useEffect } from 'react'
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

  // Sync with external changes to initial value
  useEffect(() => {
    setSearchValue(initialValue)
  }, [initialValue])

  // Call the callback when debounced value changes
  useEffect(() => {
    if (debouncedSearchValue !== initialValue) {
      onDebouncedChange(debouncedSearchValue)
    }
  }, [debouncedSearchValue, onDebouncedChange, initialValue])

  return {
    searchValue,
    setSearchValue
  }
}
