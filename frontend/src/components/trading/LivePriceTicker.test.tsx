import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { LivePriceTicker } from './LivePriceTicker'

describe('LivePriceTicker - Recent Trades Ticker (TDG)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should render empty state when no trades', () => {
      render(<LivePriceTicker trades={[]} />)
      expect(screen.getByText(/No recent trades/i)).toBeInTheDocument()
    })

    it('should render with default max trades', () => {
      const trades = [
        { price: 45.50, amount: 100, time: Date.now(), side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} />)
      expect(screen.getByText('45.50')).toBeInTheDocument()
    })

    it('should render with custom max trades', () => {
      const trades = [
        { price: 45.50, amount: 100, time: Date.now(), side: 'buy' as const },
        { price: 45.60, amount: 200, time: Date.now(), side: 'sell' as const }
      ]
      render(<LivePriceTicker trades={trades} maxTrades={1} />)
      // Should only show 1 trade
      const tradeElements = screen.getAllByTestId(/trade-\d/)
      expect(tradeElements.length).toBe(1)
    })
  })

  describe('Trade Display', () => {
    it('should display trade price with 2 decimal places', () => {
      const trades = [
        { price: 45.1234, amount: 100, time: Date.now(), side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} />)
      expect(screen.getByText('45.12')).toBeInTheDocument()
    })

    it('should display trade amount', () => {
      const trades = [
        { price: 45.50, amount: 150, time: Date.now(), side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} />)
      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('should display timestamp in HH:MM:SS format', () => {
      const trades = [
        { price: 45.50, amount: 100, time: new Date('2024-01-01T14:30:45').getTime(), side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} />)
      expect(screen.getByText('14:30:45')).toBeInTheDocument()
    })

    it('should color buy trades green', () => {
      const trades = [
        { price: 45.50, amount: 100, time: Date.now(), side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} />)
      const tradeElement = screen.getByTestId('trade-0')
      expect(tradeElement).toHaveClass('text-[#40ffa9]')
    })

    it('should color sell trades red', () => {
      const trades = [
        { price: 45.50, amount: 100, time: Date.now(), side: 'sell' as const }
      ]
      render(<LivePriceTicker trades={trades} />)
      const tradeElement = screen.getByTestId('trade-0')
      expect(tradeElement).toHaveClass('text-[#ff6b6b]')
    })
  })

  describe('Auto-scrolling', () => {
    it('should show trades in reverse chronological order (newest first)', () => {
      const baseTime = Date.now()
      const trades = [
        { price: 45.50, amount: 100, time: baseTime, side: 'buy' as const },
        { price: 45.60, amount: 200, time: baseTime + 1000, side: 'sell' as const },
        { price: 45.70, amount: 150, time: baseTime + 2000, side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} />)

      const tradeElements = screen.getAllByTestId(/trade-\d/)
      // First trade should be 45.70 (newest)
      expect(tradeElements[0]).toHaveTextContent('45.70')
    })

    it('should limit to maxTrades and show most recent', () => {
      const baseTime = Date.now()
      const trades = Array.from({ length: 15 }, (_, i) => ({
        price: 45 + i * 0.1,
        amount: 100,
        time: baseTime + i * 1000,
        side: 'buy' as const
      }))
      render(<LivePriceTicker trades={trades} maxTrades={10} />)

      const tradeElements = screen.getAllByTestId(/trade-\d/)
      expect(tradeElements.length).toBe(10)
    })

    it('should update when new trades are added', async () => {
      const initialTrades = [
        { price: 45.50, amount: 100, time: Date.now(), side: 'buy' as const }
      ]
      const { rerender } = render(<LivePriceTicker trades={initialTrades} />)

      expect(screen.getByText('45.50')).toBeInTheDocument()

      const newTrades = [
        ...initialTrades,
        { price: 45.60, amount: 200, time: Date.now() + 1000, side: 'sell' as const }
      ]
      rerender(<LivePriceTicker trades={newTrades} />)

      await waitFor(() => {
        expect(screen.getByText('45.60')).toBeInTheDocument()
      })
    })
  })

  describe('Visual Features', () => {
    it('should show connection status indicator', () => {
      render(<LivePriceTicker trades={[]} />)
      expect(screen.getByTestId('ticker-connection')).toBeInTheDocument()
    })

    it('should show "Live" when connected', () => {
      render(<LivePriceTicker trades={[]} isConnected={true} />)
      expect(screen.getByText('Live')).toBeInTheDocument()
    })

    it('should show "Disconnected" when not connected', () => {
      render(<LivePriceTicker trades={[]} isConnected={false} />)
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero amount trades', () => {
      const trades = [
        { price: 45.50, amount: 0, time: Date.now(), side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle very large amounts', () => {
      const trades = [
        { price: 45.50, amount: 999999, time: Date.now(), side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} />)
      // Should format large numbers
      expect(screen.getByText(/1000\.0K/)).toBeInTheDocument()
    })

    it('should handle maxTrades=0 gracefully', () => {
      const trades = [
        { price: 45.50, amount: 100, time: Date.now(), side: 'buy' as const }
      ]
      render(<LivePriceTicker trades={trades} maxTrades={0} />)
      expect(screen.getByText(/No recent trades/i)).toBeInTheDocument()
    })
  })

  describe('Error States - TDG RED Phase', () => {
    it('should render loading skeleton when loading prop is true', () => {
      render(<LivePriceTicker trades={[]} loading={true} />)

      expect(screen.getByTestId('ticker-skeleton')).toBeInTheDocument()
    })

    it('should display shimmer animation on skeleton', () => {
      render(<LivePriceTicker trades={[]} loading={true} />)

      const skeleton = screen.getByTestId('ticker-skeleton')
      expect(skeleton).toHaveClass(/shimmer|animate-shimmer/)
    })

    it('should render error state when error prop is provided', () => {
      const mockError = new Error('WebSocket connection failed')
      render(<LivePriceTicker trades={[]} error={mockError} />)

      expect(screen.getByTestId('ticker-error-state')).toBeInTheDocument()
    })

    it('should display investor-friendly error message for connection errors', () => {
      const mockError = new Error('WS_ERR: Handshake failed')
      render(<LivePriceTicker trades={[]} error={mockError} />)

      // Should NOT show technical error details
      expect(screen.queryByText(/WS_ERR/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Handshake/i)).not.toBeInTheDocument()

      // Should show friendly message
      expect(screen.getByText(/connection|temporarily|unavailable/i)).toBeInTheDocument()
    })

    it('should provide reconnect button on error', () => {
      const mockError = new Error('Connection lost')
      const onReconnect = vi.fn()

      render(<LivePriceTicker trades={[]} error={mockError} onReconnect={onReconnect} />)

      // ErrorState component renders "Try Again" button
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()

      tryAgainButton.click()
      expect(onReconnect).toHaveBeenCalled()
    })

    it('should use brand color #40ffa9 for reconnect button', () => {
      const mockError = new Error('Test error')
      render(<LivePriceTicker trades={[]} error={mockError} />)

      // ErrorState component uses bg-[#40ffa9] class
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toHaveClass(/#40ffa9|40ffa9/)
    })
  })
})
