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
    // If the value is empty (like during reset), set it immediately
    if (!value) {
      setDebouncedValue(value)
      return
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
