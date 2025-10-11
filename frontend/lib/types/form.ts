/* eslint-disable @typescript-eslint/no-explicit-any */
// Form type definitions for better type safety

export interface FieldApi<T = any> {
  name: string
  state: {
    value: T
    meta: {
      errors: string[]
      errorMap: Record<string, string>
      touched: boolean
      isDirty: boolean
      isTouched: boolean
      isValidating: boolean
      isValid: boolean
    }
  }
  handleChange: (value: T) => void
  handleBlur: () => void
  setValue: (value: T) => void
  getValue: () => T
  validate: () => void
}

export interface FormApi<T = any> {
  state: {
    values: T
    errors: string[]
    fieldMeta: Record<string, any>
    canSubmit: boolean
    isSubmitting: boolean
    isValid: boolean
  }
  handleSubmit: () => void
  Field: React.ComponentType<FieldProps>
  Subscribe: React.ComponentType<SubscribeProps<T>>
}

export interface FieldProps {
  name: string
  validatorAdapter?: any
  validators?: {
    onChange?: any
    onBlur?: any
    onMount?: any
  }
  children: (field: FieldApi) => React.ReactNode
}

export interface SubscribeProps<T> {
  selector?: (state: any) => any
  children: (state: { values: T; canSubmit: boolean; isSubmitting: boolean }) => React.ReactNode
}