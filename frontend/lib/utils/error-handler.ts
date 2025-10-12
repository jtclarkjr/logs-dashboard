/**
 * Utility functions for handling API errors on the frontend
 */

import { ApiError, ValidationErrorDetail } from '@/lib/clients/errors'

export interface ErrorDisplayInfo {
  title: string
  message: string
  details?: string[]
  canRetry: boolean
  suggestedAction?: string
}

/**
 * Convert an error into user-friendly display information
 */
export const getErrorDisplayInfo = (error: unknown): ErrorDisplayInfo => {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return handleApiError(error)
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
      canRetry: true,
      suggestedAction: 'Please try again.'
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      canRetry: true,
      suggestedAction: 'Please try again.'
    }
  }

  // Handle unknown error types
  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred',
    canRetry: true,
    suggestedAction: 'Please try again.'
  }
}

/**
 * Handle ApiError instances with specific logic
 */
const handleApiError = (error: ApiError): ErrorDisplayInfo => {
  const baseInfo: ErrorDisplayInfo = {
    title: 'API Error',
    message: error.message,
    canRetry: !error.isValidationError(),
    details: []
  }

  // Handle validation errors
  if (error.isValidationError()) {
    baseInfo.title = 'Validation Error'
    baseInfo.suggestedAction = 'Please check your input and try again.'

    if (error.validationErrors && error.validationErrors.length > 0) {
      baseInfo.details = error.validationErrors.map(
        (err: ValidationErrorDetail) => `${err.field}: ${err.reason}`
      )
    }

    return baseInfo
  }

  // Handle not found errors
  if (error.isNotFoundError()) {
    baseInfo.title = 'Not Found'
    baseInfo.canRetry = false
    baseInfo.suggestedAction =
      'The requested resource could not be found. Please check the URL or navigate back.'
    return baseInfo
  }

  // Handle server errors
  if (error.isServerError()) {
    baseInfo.title = 'Server Error'
    baseInfo.suggestedAction =
      'This is a server-side issue. Please try again later.'
    return baseInfo
  }

  // Handle client errors (4xx)
  if (error.status >= 400 && error.status < 500) {
    baseInfo.title = 'Request Error'
    baseInfo.suggestedAction =
      'There was an issue with your request. Please check your input and try again.'
    return baseInfo
  }

  return baseInfo
}

/**
 * Extract a simple error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.getDetailedMessage()
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unknown error occurred'
}

/**
 * Check if an error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    // Don't retry validation errors or not found errors
    return !error.isValidationError() && !error.isNotFoundError()
  }

  // By default, assume errors are retryable unless we know better
  return true
}

/**
 * Get validation errors from an API error
 */
export const getValidationErrors = (
  error: unknown
): ValidationErrorDetail[] => {
  if (error instanceof ApiError && error.validationErrors) {
    return error.validationErrors
  }

  return []
}

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (
  errors: ValidationErrorDetail[]
): string[] => {
  return errors.map((err) => `${err.field}: ${err.reason}`)
}

/**
 * Get error code if available
 */
export const getErrorCode = (error: unknown): number | undefined => {
  if (error instanceof ApiError) {
    return error.code
  }

  return undefined
}

/**
 * Get request ID if available
 */
export const getRequestId = (error: unknown): string | undefined => {
  if (error instanceof ApiError) {
    return error.requestId
  }

  return undefined
}

/**
 * Properly log errors with full details displayed
 */
export const logError = (message: string, error: unknown): void => {
  if (error instanceof ApiError) {
    console.error(message, error.toJSON())
  } else if (error instanceof Error) {
    console.error(message, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...('cause' in error && error.cause ? { cause: error.cause } : {})
    })
  } else {
    console.error(message, error)
  }
}

/**
 * Properly log warnings with full details displayed
 */
export const logWarning = (message: string, error: unknown): void => {
  if (error instanceof ApiError) {
    console.warn(message, error.toJSON())
  } else if (error instanceof Error) {
    console.warn(message, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...('cause' in error && error.cause ? { cause: error.cause } : {})
    })
  } else {
    console.warn(message, error)
  }
}
