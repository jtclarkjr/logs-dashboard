import { useState, useEffect } from 'react'

interface UseDebouncedValueOptions {
  delay?: number
}

export function useDebouncedValue<T>(
  value: T,
  { delay = 300 }: UseDebouncedValueOptions = {}
) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // If the value is empty (like during reset), set it with minimal delay
    // Use 0 delay instead of synchronous setState
    const debounceDelay = !value ? 0 : delay

    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, debounceDelay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
