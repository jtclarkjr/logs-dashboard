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
    errorData?: ApiErrorResponse,
    public response?: Response
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
        .map(err => `${err.field}: ${err.reason}`)
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
}
