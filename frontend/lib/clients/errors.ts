export interface ValidationErrorDetail {
  field: string
  value: string
  reason: string
}

export interface ApiErrorResponse {
  error: {
    message: string
    code: number
    details: {
      validation_errors?: ValidationErrorDetail[]
      total_errors?: number
      resource_id?: string
      original_error?: string
      [key: string]: unknown
    }
  }
  success: false
  request_id?: string
}

export class ApiError extends Error {
  public code: number
  public details: ApiErrorResponse['error']['details']
  public requestId?: string
  public validationErrors?: ValidationErrorDetail[]

  constructor(
    message: string,
    public status: number,
    errorData?: ApiErrorResponse
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = errorData?.error?.code || 0
    this.details = errorData?.error?.details || {}
    this.requestId = errorData?.request_id
    this.validationErrors = this.details.validation_errors || []
  }

  /**
   * Get a formatted error message including validation details
   */
  getDetailedMessage(): string {
    if (this.validationErrors && this.validationErrors.length > 0) {
      const validationMessages = this.validationErrors
        .map((err) => `${err.field}: ${err.reason}`)
        .join('; ')
      return `${this.message}. Validation errors: ${validationMessages}`
    }
    return this.message
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.code === 1001 || (this.validationErrors?.length ?? 0) > 0
  }

  /**
   * Check if this is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404 || this.code === 2001
  }

  /**
   * Check if this is a server error
   */
  isServerError(): boolean {
    return this.status >= 500
  }

  /**
   * Get a JSON representation of the error for logging
   * Usage: console.error('Error occurred:', error.toJSON())
   * Or: console.error('Error occurred:', JSON.stringify(error))
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: {
        ...this.details,
        // Ensure validation_errors are properly serialized (not showing as [Object])
        ...(this.details.validation_errors && {
          validation_errors: this.details.validation_errors.map((err) => ({
            field: err.field,
            value: err.value,
            reason: err.reason
          }))
        })
      },
      requestId: this.requestId
      // Note: top-level validationErrors omitted to avoid duplication
    }
  }

  /**
   * Get a string representation of the error with proper details display
   */
  toString(): string {
    const baseInfo = `${this.name}: ${this.message} (Status: ${this.status}, Code: ${this.code})`
    const requestInfo = this.requestId ? ` [Request ID: ${this.requestId}]` : ''
    const detailsInfo =
      Object.keys(this.details).length > 0
        ? ` Details: ${JSON.stringify(this.details, null, 2)}`
        : ''
    const validationInfo = this.validationErrors?.length
      ? ` Validation Errors: ${JSON.stringify(this.validationErrors, null, 2)}`
      : ''

    return `${baseInfo}${requestInfo}${detailsInfo}${validationInfo}`
  }
}
