/**
 * ErrorBoundary Component - TDG GREEN Phase
 *
 * Investor-friendly error boundary with:
 * - No technical jargon
 * - Clear action buttons
 * - Brand-consistent styling (#40ffa9)
 * - Recovery mechanisms
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

export interface ErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
  resetKey?: any
  fallback?: ReactNode
  showErrorDetails?: boolean
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export interface ErrorStateProps {
  type?: 'data-load' | 'critical'
  title: string
  message: string
  onRetry?: () => void
  onReset?: () => void
  showContact?: boolean
}

/**
 * ErrorState - Reusable error state component
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'critical',
  title,
  message,
  onRetry,
  onReset,
  showContact = true
}) => {
  const isDataLoad = type === 'data-load'

  return (
    <div
      data-testid="error-state"
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      {/* Icon */}
      <div className="mb-4">
        <div className="w-16 h-16 rounded-full bg-[#40ffa9]/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[#40ffa9]" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>

      {/* Message */}
      <p className="text-[#6b7280] text-sm max-w-md mb-6">{message}</p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isDataLoad && onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-[#40ffa9] text-[#0a0e17] rounded-lg font-medium hover:bg-[#40ffa9]/90 transition-all duration-300 shadow-lg shadow-[#40ffa9]/20"
          >
            Try Again
          </button>
        )}

        {!isDataLoad && onReset && (
          <button
            onClick={onReset}
            className="px-6 py-2 bg-[#40ffa9] text-[#0a0e17] rounded-lg font-medium hover:bg-[#40ffa9]/90 transition-all duration-300 shadow-lg shadow-[#40ffa9]/20"
          >
            Restart Demo
          </button>
        )}

        {!isDataLoad && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-white/20 text-white rounded-lg font-medium hover:bg-white/5 transition-all duration-300"
          >
            Continue
          </button>
        )}

        {showContact && (
          <button
            onClick={() => (window.location.href = 'mailto:support@carbonx.io')}
            className="px-6 py-2 text-[#6b7280] hover:text-white transition-colors duration-300"
          >
            Contact Support
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * ErrorBoundary - React Error Boundary wrapper
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging (but not shown to users)
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    const { onReset } = this.props

    // Clear the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })

    // Call the reset callback
    onReset?.()
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback, showErrorDetails = false } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default investor-friendly error UI
      return (
        <div
          data-testid="error-boundary"
          className="bg-[#0a0e17] min-h-screen flex items-center justify-center p-4"
        >
          <div className="bg-[#111827] rounded-2xl border border-white/5 p-8 max-w-lg w-full">
            <ErrorState
              type="critical"
              title="Something Unexpected Happened"
              message="Our team has been notified. You can continue exploring, or restart the demo to begin fresh."
              onReset={this.handleReset}
            />

            {/* Error details (hidden by default, only for debugging) */}
            {showErrorDetails && error && (
              <details className="mt-6 pt-6 border-t border-white/10">
                <summary className="text-xs text-[#6b7280] cursor-pointer">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-[#6b7280] overflow-auto max-h-32">
                  {error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return children
  }
}

ErrorBoundary.ErrorState = ErrorState

export default ErrorBoundary
