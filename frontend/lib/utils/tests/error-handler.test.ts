import { describe, it, expect, beforeEach, afterEach, jest } from 'bun:test'
import { 
  getErrorDisplayInfo,
  getErrorMessage,
  isRetryableError,
  getValidationErrors,
  formatValidationErrors,
  getErrorCode,
  getRequestId,
  logError,
  logWarning
} from '../error-handler'
import { ApiError, ValidationErrorDetail } from '@/lib/clients/errors'

// Mock console functions for testing
const mockConsoleError = jest.fn()
const mockConsoleWarn = jest.fn()
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Mock ApiError for testing
class MockApiError extends ApiError {
  constructor(
    message: string,
    public status: number = 400,
    public code?: number,
    public requestId?: string,
    public validationErrors?: ValidationErrorDetail[]
  ) {
    super(message, status, code, requestId, validationErrors)
  }
}

describe('error-handler', () => {
  beforeEach(() => {
    console.error = mockConsoleError
    console.warn = mockConsoleWarn
    mockConsoleError.mockClear()
    mockConsoleWarn.mockClear()
  })

  afterEach(() => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  })

  describe('getErrorDisplayInfo', () => {
    it('should handle ApiError instances', () => {
      const apiError = new MockApiError('API Error', 400)
      const result = getErrorDisplayInfo(apiError)
      
      expect(result).toEqual({
        title: 'Request Error',
        message: 'API Error',
        canRetry: true,
        details: [],
        suggestedAction: 'There was an issue with your request. Please check your input and try again.'
      })
    })

    it('should handle validation errors', () => {
      const validationErrors: ValidationErrorDetail[] = [
        { field: 'email', reason: 'Invalid email format' },
        { field: 'password', reason: 'Too short' }
      ]
      const apiError = new MockApiError('Validation failed', 422, undefined, undefined, validationErrors)
      const result = getErrorDisplayInfo(apiError)
      
      expect(result.title).toBe('Validation Error')
      expect(result.canRetry).toBe(false)
      expect(result.details).toEqual(['email: Invalid email format', 'password: Too short'])
    })

    it('should handle Error instances', () => {
      const error = new Error('Generic error')
      const result = getErrorDisplayInfo(error)
      
      expect(result).toEqual({
        title: 'Error',
        message: 'Generic error',
        canRetry: true,
        suggestedAction: 'Please try again.'
      })
    })

    it('should handle string errors', () => {
      const result = getErrorDisplayInfo('String error')
      
      expect(result).toEqual({
        title: 'Error',
        message: 'String error',
        canRetry: true,
        suggestedAction: 'Please try again.'
      })
    })

    it('should handle unknown error types', () => {
      const result = getErrorDisplayInfo({ unknown: 'error' })
      
      expect(result).toEqual({
        title: 'Unknown Error',
        message: 'An unexpected error occurred',
        canRetry: true,
        suggestedAction: 'Please try again.'
      })
    })
  })

  describe('getErrorMessage', () => {
    it('should extract message from Error instance', () => {
      const error = new Error('Test error message')
      const result = getErrorMessage(error)
      
      expect(result).toBe('Test error message')
    })

    it('should return string error as is', () => {
      const result = getErrorMessage('String error')
      
      expect(result).toBe('String error')
    })

    it('should return default message for unknown error', () => {
      const result = getErrorMessage({ unknown: 'error' })
      
      expect(result).toBe('An unknown error occurred')
    })

    it('should handle null/undefined errors', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred')
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred')
    })
  })

  describe('isRetryableError', () => {
    it('should return true for generic errors', () => {
      const error = new Error('Generic error')
      const result = isRetryableError(error)
      
      expect(result).toBe(true)
    })

    it('should return true for unknown errors', () => {
      const result = isRetryableError({ unknown: 'error' })
      
      expect(result).toBe(true)
    })

    it('should return true for string errors', () => {
      const result = isRetryableError('String error')
      
      expect(result).toBe(true)
    })
  })

  describe('getValidationErrors', () => {
    it('should return validation errors from ApiError', () => {
      const validationErrors: ValidationErrorDetail[] = [
        { field: 'name', reason: 'Required' }
      ]
      const apiError = new MockApiError('Validation failed', 422, undefined, undefined, validationErrors)
      
      const result = getValidationErrors(apiError)
      
      expect(result).toEqual(validationErrors)
    })

    it('should return empty array for non-ApiError', () => {
      const result = getValidationErrors(new Error('Generic error'))
      
      expect(result).toEqual([])
    })

    it('should return empty array for ApiError without validation errors', () => {
      const apiError = new MockApiError('API Error', 400)
      
      const result = getValidationErrors(apiError)
      
      expect(result).toEqual([])
    })
  })

  describe('formatValidationErrors', () => {
    it('should format validation errors correctly', () => {
      const errors: ValidationErrorDetail[] = [
        { field: 'email', reason: 'Invalid format' },
        { field: 'password', reason: 'Too short' }
      ]
      
      const result = formatValidationErrors(errors)
      
      expect(result).toEqual([
        'email: Invalid format',
        'password: Too short'
      ])
    })

    it('should handle empty array', () => {
      const result = formatValidationErrors([])
      
      expect(result).toEqual([])
    })
  })

  describe('getErrorCode', () => {
    it('should return code from ApiError', () => {
      const apiError = new MockApiError('API Error', 400, 1001)
      
      const result = getErrorCode(apiError)
      
      expect(result).toBe(1001)
    })

    it('should return undefined for non-ApiError', () => {
      const result = getErrorCode(new Error('Generic error'))
      
      expect(result).toBeUndefined()
    })
  })

  describe('getRequestId', () => {
    it('should return request ID from ApiError', () => {
      const apiError = new MockApiError('API Error', 400, undefined, 'req-123')
      
      const result = getRequestId(apiError)
      
      expect(result).toBe('req-123')
    })

    it('should return undefined for non-ApiError', () => {
      const result = getRequestId(new Error('Generic error'))
      
      expect(result).toBeUndefined()
    })
  })

  describe('logError', () => {
    it('should log Error instances with details', () => {
      const error = new Error('Test error')
      error.stack = 'Error stack trace'
      
      logError('Test message', error)
      
      expect(mockConsoleError).toHaveBeenCalledWith('Test message', {
        name: 'Error',
        message: 'Test error',
        stack: 'Error stack trace'
      })
    })

    it('should log unknown errors directly', () => {
      const error = { unknown: 'error' }
      
      logError('Test message', error)
      
      expect(mockConsoleError).toHaveBeenCalledWith('Test message', error)
    })
  })

  describe('logWarning', () => {
    it('should log Error instances as warnings', () => {
      const error = new Error('Test warning')
      
      logWarning('Test message', error)
      
      expect(mockConsoleWarn).toHaveBeenCalledWith('Test message', {
        name: 'Error',
        message: 'Test warning',
        stack: error.stack
      })
    })

    it('should log unknown errors as warnings', () => {
      const error = { unknown: 'warning' }
      
      logWarning('Test message', error)
      
      expect(mockConsoleWarn).toHaveBeenCalledWith('Test message', error)
    })
  })
})
