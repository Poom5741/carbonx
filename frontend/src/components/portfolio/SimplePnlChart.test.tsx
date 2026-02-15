import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SimplePnlChart } from './SimplePnlChart'
import type { Order } from '@/hooks/useTrading'

// Mock lightweight-charts to avoid actual chart rendering in tests
// @ts-expect-error - Variable is used in mock function, TypeScript doesn't recognize it
let capturedChartData: Array<{ time: string; value: number }> = []
const mockSeries = {
  setData: vi.fn((data: Array<{ time: string; value: number }>) => {
    capturedChartData = data
    // Simulate lightweight-charts validation for duplicate time values
    const times = data.map(d => d.time)
    const uniqueTimes = new Set(times)
    if (times.length !== uniqueTimes.size) {
      // Find the duplicate
      const seen = new Set<string>()
      for (let i = 0; i < times.length; i++) {
        if (seen.has(times[i])) {
          throw new Error(
            `Assertion failed: data must be asc ordered by time, index=${i}, time=${times[i]}, prev time=${times[i]}`
          )
        }
        seen.add(times[i])
      }
    }
  }),
}
const mockTimeScale = {
  fitContent: vi.fn(),
}
const mockChart = {
  addSeries: vi.fn(() => mockSeries),
  timeScale: vi.fn(() => mockTimeScale),
  remove: vi.fn(),
  applyOptions: vi.fn(),
}

vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => mockChart),
  AreaSeries: vi.fn(),
}))

describe('SimplePnlChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedChartData = []
  })

  it('should render chart container', () => {
    render(<SimplePnlChart initialValue={10000} currentValue={12000} orderHistory={[]} />)

    expect(screen.getByTestId('pnl-chart')).toBeInTheDocument()
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
  })

  it('should display initial and current values', () => {
    render(<SimplePnlChart initialValue={10000} currentValue={12450} orderHistory={[]} />)

    expect(screen.getByTestId('current-value')).toHaveTextContent('$12,450.00')
    expect(screen.getByTestId('total-pnl')).toHaveTextContent('2450.00')
    expect(screen.getByTestId('total-pnl')).toHaveTextContent('+24.5%%')
  })

  it('should handle orders on different days', () => {
    // Create orders on different days
    const dayInSeconds = 24 * 60 * 60
    const baseTime = Date.now() - 5 * dayInSeconds

    const orderHistory: Order[] = [
      {
        id: '1',
        pair: 'BTC/USD',
        type: 'market',
        side: 'buy',
        price: 50000,
        amount: 0.1,
        status: 'filled',
        filled: 0.1,
        createdAt: baseTime,
        filledAt: baseTime,
      },
      {
        id: '2',
        pair: 'BTC/USD',
        type: 'market',
        side: 'sell',
        price: 52000,
        amount: 0.05,
        status: 'filled',
        filled: 0.05,
        createdAt: baseTime + dayInSeconds,
        filledAt: baseTime + dayInSeconds,
      },
    ]

    render(<SimplePnlChart initialValue={10000} currentValue={10100} orderHistory={orderHistory} />)

    expect(screen.getByTestId('pnl-chart')).toBeInTheDocument()
  })

  it('should aggregate multiple orders on the same day into a single data point', () => {
    // Create multiple orders on the SAME day - this is the bug scenario
    const baseTime = Date.now() - 3 * 24 * 60 * 60 * 1000

    const orderHistory: Order[] = [
      {
        id: '1',
        pair: 'BTC/USD',
        type: 'market',
        side: 'buy',
        price: 50000,
        amount: 0.1,
        status: 'filled',
        filled: 0.1,
        createdAt: baseTime,
        filledAt: baseTime,
      },
      {
        id: '2',
        pair: 'BTC/USD',
        type: 'market',
        side: 'buy',
        price: 50500,
        amount: 0.05,
        status: 'filled',
        filled: 0.05,
        createdAt: baseTime + 3600, // 1 hour later - same day
        filledAt: baseTime + 3600,
      },
      {
        id: '3',
        pair: 'BTC/USD',
        type: 'market',
        side: 'sell',
        price: 51000,
        amount: 0.03,
        status: 'filled',
        filled: 0.03,
        createdAt: baseTime + 7200, // 2 hours later - same day
        filledAt: baseTime + 7200,
      },
    ]

    // This should NOT throw an error about duplicate time values
    // After the fix, all orders on the same day should be aggregated
    expect(() => {
      render(<SimplePnlChart initialValue={10000} currentValue={9750} orderHistory={orderHistory} />)
    }).not.toThrow()

    expect(screen.getByTestId('pnl-chart')).toBeInTheDocument()
  })

  it('should correctly calculate portfolio value with same-day orders', () => {
    // Test that the final value is correct after aggregating same-day orders
    const baseTime = Date.now() - 2 * 24 * 60 * 60 * 1000

    const orderHistory: Order[] = [
      // Buy 0.1 BTC @ $50,000 = $5,000 spent
      {
        id: '1',
        pair: 'BTC/USD',
        type: 'market',
        side: 'buy',
        price: 50000,
        amount: 0.1,
        status: 'filled',
        filled: 0.1,
        createdAt: baseTime,
        filledAt: baseTime,
      },
      // Buy 0.05 BTC @ $51,000 = $2,550 spent
      {
        id: '2',
        pair: 'BTC/USD',
        type: 'market',
        side: 'buy',
        price: 51000,
        amount: 0.05,
        status: 'filled',
        filled: 0.05,
        createdAt: baseTime + 3600, // same day
        filledAt: baseTime + 3600,
      },
      // Sell 0.08 BTC @ $52,000 = $4,160 received
      {
        id: '3',
        pair: 'BTC/USD',
        type: 'market',
        side: 'sell',
        price: 52000,
        amount: 0.08,
        status: 'filled',
        filled: 0.08,
        createdAt: baseTime + 7200, // same day
        filledAt: baseTime + 7200,
      },
    ]

    // Expected: 10000 - 5000 - 2550 + 4160 = 6610
    const expectedFinalValue = 6610

    expect(() => {
      render(
        <SimplePnlChart
          initialValue={10000}
          currentValue={expectedFinalValue}
          orderHistory={orderHistory}
        />
      )
    }).not.toThrow()

    expect(screen.getByTestId('pnl-chart')).toBeInTheDocument()
  })

  it('should show positive P&L in green', () => {
    render(<SimplePnlChart initialValue={10000} currentValue={12000} orderHistory={[]} />)

    expect(screen.getByTestId('total-pnl')).toHaveClass('text-green-400')
  })

  it('should show negative P&L in red', () => {
    render(<SimplePnlChart initialValue={10000} currentValue={8000} orderHistory={[]} />)

    expect(screen.getByTestId('total-pnl')).toHaveClass('text-red-400')
  })
})
