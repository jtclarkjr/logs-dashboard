'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Form field wrapper that integrates with forms
interface FormFieldWrapperProps {
  label?: string
  description?: string
  required?: boolean
  errors?: string[]
  children: React.ReactNode
  className?: string
}

export function FormFieldWrapper({
  label,
  description,
  required,
  errors,
  children,
  className
}: FormFieldWrapperProps) {
  const hasError = errors && errors.length > 0

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            hasError && 'text-destructive'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div>{children}</div>
      {description && !hasError && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {hasError && (
        <div className="text-sm text-destructive">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  )
}
