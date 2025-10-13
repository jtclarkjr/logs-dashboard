/// <reference lib="dom" />
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'bun:test'
import { toHaveAccessibleDescription, toHaveAccessibleName, toHaveAttribute, toHaveClass, toHaveDisplayValue, toHaveFocus, toHaveFormValues, toHaveStyle, toHaveTextContent, toHaveValue, toBeChecked, toBeDisabled, toBeEmptyDOMElement, toBeEnabled, toBeInTheDocument, toBeInvalid, toBePartiallyChecked, toBeRequired, toBeValid, toBeVisible, toHaveErrorMessage } from '@testing-library/jest-dom/matchers'

// Extend expect with jest-dom matchers
expect.extend({
  toHaveAccessibleDescription,
  toHaveAccessibleName,
  toHaveAttribute,
  toHaveClass,
  toHaveDisplayValue,
  toHaveFocus,
  toHaveFormValues,
  toHaveStyle,
  toHaveTextContent,
  toHaveValue,
  toBeChecked,
  toBeDisabled,
  toBeEmptyDOMElement,
  toBeEnabled,
  toBeInTheDocument,
  toBeInvalid,
  toBePartiallyChecked,
  toBeRequired,
  toBeValid,
  toBeVisible,
  toHaveErrorMessage
})

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
