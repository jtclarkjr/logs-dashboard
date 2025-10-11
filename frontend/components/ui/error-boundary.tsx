'use client'

import { Component, ReactNode } from 'react'
import { Alert, AlertDescription } from './alert'
import { Button } from './button'
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <div>
              <strong>Something went wrong</strong>
              <p className="text-sm mt-1">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="w-fit"
            >
              <RefreshCwIcon className="h-3 w-3 mr-2" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Simpler error display component for query errors
interface QueryErrorProps {
  error: Error
  onRetry?: () => void
  title?: string
}

export function QueryError({
  error,
  onRetry,
  title = 'Failed to load data'
}: QueryErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangleIcon className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-3">
        <div>
          <strong>{title}</strong>
          <p className="text-sm mt-1">
            {error.message || 'An error occurred while fetching data'}
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-fit"
          >
            <RefreshCwIcon className="h-3 w-3 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
