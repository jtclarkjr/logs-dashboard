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
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
