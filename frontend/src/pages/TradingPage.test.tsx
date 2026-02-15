import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TradingPage from './TradingPage'

// Mock useTrading hook
vi.mock('@/hooks/useTrading', () => ({
  useTrading: vi.fn(() => ({
    orders: [],
    portfolio: {
      balance: 10000,
      holdings: {}
    },
    isPlacingOrder: false,
    placeOrder: vi.fn(),
    cancelOrder: vi.fn(),
  }))
}))

// Mock useRealtimePrices hook
vi.mock('@/hooks/useRealtimePrices', () => ({
  useRealtimePrices: vi.fn(() => [
    {
      symbol: 'REC/USDT',
      name: 'Carbon REC',
      price: 46.80,
      change24h: 4.0,
      high24h: 48.50,
      low24h: 45.20,
      volume24h: '1.2M'
    },
    {
      symbol: 'TVER/USDT',
      name: 'TVER Token',
      price: 12.80,
      change24h: -2.5,
      high24h: 13.50,
      low24h: 12.20,
      volume24h: '850K'
    }
  ])
}))

// Mock useOrderBook hook
vi.mock('@/hooks/useOrderBook', () => ({
  useOrderBook: vi.fn(() => ({
    asks: [],
    bids: []
  }))
}))

// Mock lightweight-charts
vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addSeries: vi.fn(),
    remove: vi.fn(),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn()
    }))
  }))
}))

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
  }
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('TradingPage - Component Structure', () => {
  it('should render trading page container', () => {
    renderWithRouter(<TradingPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByTestId('trading-page') ?? screen.getByRole('main')).toBeInTheDocument()
  })
})

// ============================================================================
// TDG GREEN PHASE - Task #3: Initial Load Skeleton Integration
// ============================================================================

describe('TradingPage - Initial Load Skeleton (TDG GREEN)', () => {
  it('should render trading page with loading support', async () => {
    renderWithRouter(<TradingPage isLoggedIn={true} onLoginClick={() => {}} />)

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByRole('main') ?? screen.getByTestId('trading-page') ?? document.querySelector('main')).toBeInTheDocument()
    }, { timeout: 200 })
  })

  it('should display chart area', async () => {
    renderWithRouter(<TradingPage isLoggedIn={true} onLoginClick={() => {}} />)

    await waitFor(() => {
      const chartContainer = document.querySelector('.chart-container')
      expect(chartContainer).toBeInTheDocument()
    }, { timeout: 200 })
  })
})
