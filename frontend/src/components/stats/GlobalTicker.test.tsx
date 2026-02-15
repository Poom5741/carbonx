import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlobalTicker } from './GlobalTicker'

describe('GlobalTicker', () => {
  it('should render ticker with market stats', () => {
    const mockStats = {
      volume24h: 1250000,
      activeTraders: 342,
      topTraders: [
        { address: '0x1234...5678', pnl: 45.2 },
        { address: '0x9876...4321', pnl: 32.8 },
        { address: '0xabcd...ef01', pnl: 28.5 },
        { address: '0x5555...aaaa', pnl: 21.3 },
        { address: '0xbbbb...cccc', pnl: 18.9 }
      ]
    }

    render(<GlobalTicker stats={mockStats} />)

    expect(screen.getByTestId('global-ticker')).toBeInTheDocument()
    expect(screen.getByText(/24h volume/i)).toBeInTheDocument()
    expect(screen.getByText(/active traders/i)).toBeInTheDocument()
  })

  it('should format volume correctly', () => {
    const mockStats = {
      volume24h: 1250000,
      activeTraders: 342,
      topTraders: []
    }

    render(<GlobalTicker stats={mockStats} />)

    expect(screen.getByText('$1.25M')).toBeInTheDocument()
  })

  it('should display top traders', () => {
    const mockStats = {
      volume24h: 1250000,
      activeTraders: 342,
      topTraders: [
        { address: '0x1234...5678', pnl: 45.2 },
        { address: '0x9876...4321', pnl: 32.8 }
      ]
    }

    render(<GlobalTicker stats={mockStats} />)

    expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
    expect(screen.getByText('0x9876...4321')).toBeInTheDocument()
    expect(screen.getByText('+45.2%')).toBeInTheDocument()
  })

  it('should show positive PnL in green', () => {
    const mockStats = {
      volume24h: 1250000,
      activeTraders: 342,
      topTraders: [
        { address: '0x1234...5678', pnl: 45.2 }
      ]
    }

    render(<GlobalTicker stats={mockStats} />)

    const pnlElement = screen.getByText('+45.2%')
    expect(pnlElement.closest('span')).toHaveClass('text-green-400')
  })

  it('should handle empty stats gracefully', () => {
    const mockStats = {
      volume24h: 0,
      activeTraders: 0,
      topTraders: []
    }

    render(<GlobalTicker stats={mockStats} />)

    expect(screen.getByTestId('global-ticker')).toBeInTheDocument()
  })
})
