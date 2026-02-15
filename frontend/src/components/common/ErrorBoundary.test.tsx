/**
 * ErrorBoundary Tests - TDG RED Phase
 *
 * Testing error boundary behavior for investor-friendly error handling
 *
 * Error States:
 * 1. Data Load Error - retryable with friendly message
 * 2. Critical Error - app-level with reset option
 * 3. Component Error - caught by boundary
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

// Mock console.error to avoid cluttering test output
const originalError = console.error
beforeAll(() => {
  console.error = vi.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary - TDG RED Phase', () => {
  describe('Error State Detection', () => {
    it('should catch and display component errors', () => {
      const ThrowError = () => {
        throw new Error('Component crashed')
      }

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      expect(screen.getByText(/something unexpected happened/i)).toBeInTheDocument()
    })

    it('should display error fallback instead of crashing', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }

      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // Should not render the broken component
      expect(container.querySelector('throw-error')).not.toBeInTheDocument()
      // Should show error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    })

    it('should preserve children when no error occurs', () => {
      const HealthyComponent = () => <div data-testid="healthy">Working fine</div>

      render(
        <ErrorBoundary>
          <HealthyComponent />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('healthy')).toBeInTheDocument()
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument()
    })
  })

  describe('Error Message Content', () => {
    it('should show investor-friendly message (no technical jargon)', () => {
      const ThrowError = () => {
        throw new Error('500 Internal Server Error')
      }

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // Should NOT show technical error details
      expect(screen.queryByText(/500/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Internal Server Error/i)).not.toBeInTheDocument()

      // Should show friendly message
      expect(screen.getByText(/something unexpected happened/i)).toBeInTheDocument()
    })

    it('should provide action buttons', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // Should have action buttons
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /restart demo/i })).toBeInTheDocument()
    })

    it('should call onReset callback when restart is clicked', () => {
      const onReset = vi.fn()
      const ThrowError = () => {
        throw new Error('Test error')
      }

      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError />
        </ErrorBoundary>
      )

      const restartButton = screen.getByRole('button', { name: /restart demo/i })
      fireEvent.click(restartButton)

      expect(onReset).toHaveBeenCalled()
    })
  })

  describe('Error Recovery', () => {
    it('should recover after reset callback', () => {
      let shouldThrow = true
      const ThrowSometimes = () => {
        if (shouldThrow) throw new Error('Error!')
        return <div data-testid="recovered">Recovered!</div>
      }

      const onReset = vi.fn(() => {
        shouldThrow = false
      })

      const { rerender } = render(
        <ErrorBoundary onReset={onReset} resetKey={shouldThrow}>
          <ThrowSometimes />
        </ErrorBoundary>
      )

      // Initially shows error
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()

      // Reset and recover
      fireEvent.click(screen.getByRole('button', { name: /restart demo/i }))

      // After reset, should reset the boundary
      expect(onReset).toHaveBeenCalled()
    })
  })

  describe('Data Load Error State', () => {
    it('should render data load error component', () => {
      const { container } = render(
        <ErrorBoundary.ErrorState
          type="data-load"
          title="Energy Data Temporarily Unavailable"
          message="We're having trouble connecting to the energy monitoring system."
          onRetry={vi.fn()}
        />
      )

      expect(screen.getByText(/energy data temporarily unavailable/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', () => {
      const onRetry = vi.fn()

      render(
        <ErrorBoundary.ErrorState
          type="data-load"
          title="Connection Error"
          message="Unable to load data"
          onRetry={onRetry}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /try again/i }))
      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('Critical Error State', () => {
    it('should render critical error component', () => {
      render(
        <ErrorBoundary.ErrorState
          type="critical"
          title="Something Unexpected Happened"
          message="Our team has been notified."
          onReset={vi.fn()}
        />
      )

      expect(screen.getByText(/something unexpected happened/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /restart demo/i })).toBeInTheDocument()
    })
  })
})
