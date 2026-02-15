import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PnlChart } from './PnlChart'

describe('PnlChart', () => {
  it('should render chart with historical data', () => {
    const mockData = [
      { date: '2025-01-01', value: 10000, pnl: 0 },
      { date: '2025-01-02', value: 10250, pnl: 2.5 },
      { date: '2025-01-03', value: 10100, pnl: 1.0 },
      { date: '2025-01-04', value: 10800, pnl: 8.0 },
      { date: '2025-01-05', value: 11200, pnl: 12.0 },
      { date: '2025-01-06', value: 10900, pnl: 9.0 },
      { date: '2025-01-07', value: 12450, pnl: 24.5 }
    ]

    render(<PnlChart data={mockData} />)

    // Chart container should be present
    expect(screen.getByTestId('pnl-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pnl-chart')).toHaveTextContent('Portfolio Performance')
  })

  it('should display current value and total P&L', () => {
    const mockData = [
      { date: '2025-01-01', value: 10000, pnl: 0 },
      { date: '2025-01-07', value: 12450, pnl: 24.5 }
    ]

    render(<PnlChart data={mockData} />)

    expect(screen.getByTestId('current-value')).toHaveTextContent('$12,450.00')
    expect(screen.getByTestId('total-pnl')).toHaveTextContent('+24.5%')
  })

  it('should show positive P&L in green', () => {
    const mockData = [
      { date: '2025-01-01', value: 10000, pnl: 0 },
      { date: '2025-01-07', value: 12450, pnl: 24.5 }
    ]

    render(<PnlChart data={mockData} />)

    expect(screen.getByTestId('total-pnl')).toHaveClass('text-green-400')
  })

  it('should show negative P&L in red', () => {
    const mockData = [
      { date: '2025-01-01', value: 10000, pnl: 0 },
      { date: '2025-01-07', value: 9500, pnl: -5.0 }
    ]

    render(<PnlChart data={mockData} />)

    expect(screen.getByTestId('total-pnl')).toHaveClass('text-red-400')
  })

  it('should handle empty data gracefully', () => {
    render(<PnlChart data={[]} />)

    expect(screen.getByTestId('pnl-chart')).toBeInTheDocument()
    expect(screen.getByTestId('no-data-message')).toBeInTheDocument()
  })
})
