import { describe, it, expect } from 'bun:test'
import {
  ApiError,
  type ApiErrorResponse,
  type ValidationErrorDetail
} from '../errors'

describe('ApiError', () => {
  describe('Constructor', () => {
    it('should create ApiError with minimal parameters', () => {
      const error = new ApiError('Test error', 400)

      expect(error.name).toBe('ApiError')
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(400)
      expect(error.code).toBe(0)
      expect(error.details).toEqual({})
      expect(error.requestId).toBeUndefined()
      expect(error.validationErrors).toEqual([])
    })

    it('should create ApiError with full error response data', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Validation failed',
          code: 1001,
          details: {
            validation_errors: [
              {
                field: 'email',
                value: 'invalid',
                reason: 'Invalid email format'
              },
              { field: 'age', value: '-1', reason: 'Must be positive' }
            ],
            total_errors: 2,
            resource_id: 'user-123'
          }
        },
        success: false,
        request_id: 'req-abc123'
      }

      const error = new ApiError('Validation failed', 422, errorResponse)

      expect(error.name).toBe('ApiError')
      expect(error.message).toBe('Validation failed')
      expect(error.status).toBe(422)
      expect(error.code).toBe(1001)
      expect(error.requestId).toBe('req-abc123')
      expect(error.validationErrors).toEqual([
        { field: 'email', value: 'invalid', reason: 'Invalid email format' },
        { field: 'age', value: '-1', reason: 'Must be positive' }
      ])
      expect(error.details.total_errors).toBe(2)
      expect(error.details.resource_id).toBe('user-123')
    })

    it('should handle partial error response data', () => {
      const errorResponse: Partial<ApiErrorResponse> = {
        error: {
          message: 'Server error',
          code: 5001,
          details: {}
        }
      }

      const error = new ApiError(
        'Server error',
        500,
        errorResponse as ApiErrorResponse
      )

      expect(error.code).toBe(5001)
      expect(error.details).toEqual({})
      expect(error.validationErrors).toEqual([])
      expect(error.requestId).toBeUndefined()
    })

    it('should handle missing error object in response', () => {
      const errorResponse = {
        success: false,
        request_id: 'req-456'
      } as ApiErrorResponse

      const error = new ApiError('Unknown error', 500, errorResponse)

      expect(error.code).toBe(0)
      expect(error.details).toEqual({})
      expect(error.requestId).toBe('req-456')
    })
  })

  describe('getDetailedMessage', () => {
    it('should return basic message when no validation errors', () => {
      const error = new ApiError('Basic error', 400)

      expect(error.getDetailedMessage()).toBe('Basic error')
    })

    it('should include validation errors in detailed message', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Validation failed',
          code: 1001,
          details: {
            validation_errors: [
              { field: 'name', value: '', reason: 'Required field' },
              { field: 'email', value: 'invalid', reason: 'Invalid format' }
            ]
          }
        },
        success: false
      }

      const error = new ApiError('Validation failed', 422, errorResponse)

      expect(error.getDetailedMessage()).toBe(
        'Validation failed. Validation errors: name: Required field; email: Invalid format'
      )
    })

    it('should handle single validation error', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Invalid input',
          code: 1001,
          details: {
            validation_errors: [
              { field: 'password', value: '123', reason: 'Too short' }
            ]
          }
        },
        success: false
      }

      const error = new ApiError('Invalid input', 422, errorResponse)

      expect(error.getDetailedMessage()).toBe(
        'Invalid input. Validation errors: password: Too short'
      )
    })

    it('should handle empty validation errors array', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Error occurred',
          code: 1001,
          details: {
            validation_errors: []
          }
        },
        success: false
      }

      const error = new ApiError('Error occurred', 400, errorResponse)

      expect(error.getDetailedMessage()).toBe('Error occurred')
    })
  })

  describe('isValidationError', () => {
    it('should return true when code is 1001', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Validation error',
          code: 1001,
          details: {}
        },
        success: false
      }

      const error = new ApiError('Validation error', 422, errorResponse)

      expect(error.isValidationError()).toBe(true)
    })

    it('should return true when validation errors exist', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Error',
          code: 2000,
          details: {
            validation_errors: [
              { field: 'test', value: 'invalid', reason: 'Invalid' }
            ]
          }
        },
        success: false
      }

      const error = new ApiError('Error', 400, errorResponse)

      expect(error.isValidationError()).toBe(true)
    })

    it('should return false when no validation indicators', () => {
      const error = new ApiError('Generic error', 500)

      expect(error.isValidationError()).toBe(false)
    })

    it('should return false when code is not 1001 and no validation errors', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Server error',
          code: 5001,
          details: {}
        },
        success: false
      }

      const error = new ApiError('Server error', 500, errorResponse)

      expect(error.isValidationError()).toBe(false)
    })
  })

  describe('isNotFoundError', () => {
    it('should return true when status is 404', () => {
      const error = new ApiError('Not found', 404)

      expect(error.isNotFoundError()).toBe(true)
    })

    it('should return true when code is 2001', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Resource not found',
          code: 2001,
          details: {}
        },
        success: false
      }

      const error = new ApiError('Resource not found', 400, errorResponse)

      expect(error.isNotFoundError()).toBe(true)
    })

    it('should return true when both status and code indicate not found', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Not found',
          code: 2001,
          details: {}
        },
        success: false
      }

      const error = new ApiError('Not found', 404, errorResponse)

      expect(error.isNotFoundError()).toBe(true)
    })

    it('should return false when neither status nor code indicate not found', () => {
      const error = new ApiError('Generic error', 400)

      expect(error.isNotFoundError()).toBe(false)
    })
  })

  describe('isServerError', () => {
    it('should return true for 500 status', () => {
      const error = new ApiError('Internal server error', 500)

      expect(error.isServerError()).toBe(true)
    })

    it('should return true for 502 status', () => {
      const error = new ApiError('Bad gateway', 502)

      expect(error.isServerError()).toBe(true)
    })

    it('should return true for 503 status', () => {
      const error = new ApiError('Service unavailable', 503)

      expect(error.isServerError()).toBe(true)
    })

    it('should return false for 4xx status codes', () => {
      const error400 = new ApiError('Bad request', 400)
      const error404 = new ApiError('Not found', 404)
      const error422 = new ApiError('Validation error', 422)

      expect(error400.isServerError()).toBe(false)
      expect(error404.isServerError()).toBe(false)
      expect(error422.isServerError()).toBe(false)
    })

    it('should return false for 2xx and 3xx status codes', () => {
      const error200 = new ApiError('Success', 200)
      const error302 = new ApiError('Redirect', 302)

      expect(error200.isServerError()).toBe(false)
      expect(error302.isServerError()).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should serialize basic error to JSON', () => {
      const error = new ApiError('Basic error', 400)

      const json = error.toJSON()

      expect(json).toEqual({
        name: 'ApiError',
        message: 'Basic error',
        status: 400,
        code: 0,
        details: {},
        requestId: undefined
      })
    })

    it('should serialize complete error with all data to JSON', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Complex error',
          code: 1001,
          details: {
            validation_errors: [
              { field: 'name', value: '', reason: 'Required' }
            ],
            total_errors: 1,
            resource_id: 'res-123'
          }
        },
        success: false,
        request_id: 'req-456'
      }

      const error = new ApiError('Complex error', 422, errorResponse)

      const json = error.toJSON()

      expect(json).toEqual({
        name: 'ApiError',
        message: 'Complex error',
        status: 422,
        code: 1001,
        details: {
          validation_errors: [{ field: 'name', value: '', reason: 'Required' }],
          total_errors: 1,
          resource_id: 'res-123'
        },
        requestId: 'req-456'
      })
    })

    it('should properly serialize validation errors to avoid [Object] display', () => {
      const validationErrors: ValidationErrorDetail[] = [
        { field: 'email', value: 'test@', reason: 'Invalid email' },
        { field: 'phone', value: '123', reason: 'Too short' }
      ]

      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Validation failed',
          code: 1001,
          details: {
            validation_errors: validationErrors
          }
        },
        success: false
      }

      const error = new ApiError('Validation failed', 422, errorResponse)

      const json = error.toJSON()

      expect(json.details.validation_errors).toEqual([
        { field: 'email', value: 'test@', reason: 'Invalid email' },
        { field: 'phone', value: '123', reason: 'Too short' }
      ])
    })

    it('should handle details without validation errors', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Error',
          code: 5001,
          details: {
            resource_id: 'res-789',
            original_error: 'Database connection failed'
          }
        },
        success: false,
        request_id: 'req-999'
      }

      const error = new ApiError('Error', 500, errorResponse)

      const json = error.toJSON()

      expect(json.details).toEqual({
        resource_id: 'res-789',
        original_error: 'Database connection failed'
      })
      expect(json.details.validation_errors).toBeUndefined()
    })
  })

  describe('toString', () => {
    it('should create string representation with minimal data', () => {
      const error = new ApiError('Basic error', 400)

      const str = error.toString()

      expect(str).toBe('ApiError: Basic error (Status: 400, Code: 0)')
    })

    it('should include request ID when available', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Error with request ID',
          code: 1001,
          details: {}
        },
        success: false,
        request_id: 'req-123'
      }

      const error = new ApiError('Error with request ID', 400, errorResponse)

      const str = error.toString()

      expect(str).toContain('[Request ID: req-123]')
    })

    it('should include details when present', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Error with details',
          code: 2001,
          details: {
            resource_id: 'user-456',
            total_errors: 1
          }
        },
        success: false
      }

      const error = new ApiError('Error with details', 404, errorResponse)

      const str = error.toString()

      expect(str).toContain('Details: {')
      expect(str).toContain('"resource_id": "user-456"')
      expect(str).toContain('"total_errors": 1')
    })

    it('should include validation errors when present', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Validation error',
          code: 1001,
          details: {
            validation_errors: [
              { field: 'email', value: 'invalid', reason: 'Bad format' }
            ]
          }
        },
        success: false
      }

      const error = new ApiError('Validation error', 422, errorResponse)

      const str = error.toString()

      expect(str).toContain('Validation Errors: [')
      expect(str).toContain('"field": "email"')
      expect(str).toContain('"reason": "Bad format"')
    })

    it('should create complete string representation with all data', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Complex error',
          code: 1001,
          details: {
            validation_errors: [
              { field: 'name', value: '', reason: 'Required' }
            ],
            resource_id: 'user-789'
          }
        },
        success: false,
        request_id: 'req-999'
      }

      const error = new ApiError('Complex error', 422, errorResponse)

      const str = error.toString()

      expect(str).toContain('ApiError: Complex error (Status: 422, Code: 1001)')
      expect(str).toContain('[Request ID: req-999]')
      expect(str).toContain('Details: {')
      expect(str).toContain('Validation Errors: [')
    })

    it('should not include empty details or validation errors sections', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Simple error',
          code: 5001,
          details: {}
        },
        success: false
      }

      const error = new ApiError('Simple error', 500, errorResponse)
      error.validationErrors = []

      const str = error.toString()

      expect(str).toBe('ApiError: Simple error (Status: 500, Code: 5001)')
      expect(str).not.toContain('Details:')
      expect(str).not.toContain('Validation Errors:')
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle undefined validation errors in details', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Error',
          code: 1001,
          details: {
            validation_errors: undefined
          }
        },
        success: false
      }

      const error = new ApiError('Error', 400, errorResponse)

      expect(error.validationErrors).toEqual([])
      expect(error.isValidationError()).toBe(true) // Because code is 1001
    })

    it('should handle null validation errors in details', () => {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: 'Error',
          code: 2001,
          details: {
            validation_errors: null
          }
        },
        success: false
      }

      const error = new ApiError('Error', 400, errorResponse)

      expect(error.validationErrors).toEqual([])
      expect(error.isValidationError()).toBe(false) // Code is not 1001 and no valid validation errors
    })

    it('should inherit from Error correctly', () => {
      const error = new ApiError('Test error', 400)

      expect(error instanceof Error).toBe(true)
      expect(error instanceof ApiError).toBe(true)
    })

    it('should work with JSON.stringify', () => {
      const error = new ApiError('Serializable error', 400)

      expect(() => JSON.stringify(error)).not.toThrow()

      const serialized = JSON.stringify(error)
      const parsed = JSON.parse(serialized)

      expect(parsed.name).toBe('ApiError')
      expect(parsed.message).toBe('Serializable error')
      expect(parsed.status).toBe(400)
    })
  })
})
