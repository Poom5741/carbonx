import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock useTrading hook before App import
vi.mock('@/hooks/useTrading', () => ({
  useTrading: vi.fn(() => ({
    orders: [],
    portfolio: {
      balance: 10000,
      holdings: {}
    },
    orderHistory: [],
    cancelOrder: vi.fn(),
    resetData: vi.fn(),
    getTotalValue: vi.fn(() => 10000),
    isPlacingOrder: false,
    placeOrder: vi.fn(),
    simulateOrderFill: vi.fn()
  }))
}))

// Mock SimplePnlChart component (uses lightweight-charts which needs canvas)
vi.mock('@/components/portfolio/SimplePnlChart', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="pnl-chart" className="bg-[#111827] rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-2">Portfolio Performance</h2>
      <div className="flex items-center gap-4">
        <div>
          <p className="text-gray-400 text-xs">Current Value</p>
          <p data-testid="current-value" className="text-2xl font-bold text-white">$10,000.00</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Total P&L</p>
          <p data-testid="total-pnl" className="text-lg font-semibold text-green-400">+0.0%</p>
        </div>
      </div>
    </div>
  ),
  SimplePnlChart: () => (
    <div data-testid="pnl-chart" className="bg-[#111827] rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-2">Portfolio Performance</h2>
      <div className="flex items-center gap-4">
        <div>
          <p className="text-gray-400 text-xs">Current Value</p>
          <p data-testid="current-value" className="text-2xl font-bold text-white">$10,000.00</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Total P&L</p>
          <p data-testid="total-pnl" className="text-lg font-semibold text-green-400">+0.0%</p>
        </div>
      </div>
    </div>
  )
}))

// Import App after mocks are set up
import App from './App'

describe('App - Integration Tests', () => {
  describe('Navigation Structure', () => {
    it('should render navigation with responsive classes', () => {
      render(<App />)

      // Check that nav exists
      const nav = screen.getAllByRole('navigation')[0]
      expect(nav).toBeInTheDocument()

      // Check for desktop navigation with responsive classes
      const desktopNav = nav.querySelector('.hidden.md\\:flex')
      expect(desktopNav).toBeInTheDocument()
    })

    it('should include Portfolio link in navigation', () => {
      render(<App />)

      // Get the navigation
      const nav = screen.getAllByRole('navigation')[0]

      // Find Portfolio link within the navigation
      const portfolioLink = within(nav).getByText('Portfolio')
      expect(portfolioLink).toBeInTheDocument()
    })
  })

  describe('Portfolio Route Integration', () => {
    it('should navigate to Portfolio page', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Get the navigation
      const nav = screen.getAllByRole('navigation')[0]
      const portfolioLink = within(nav).getByText('Portfolio')

      // Click Portfolio link
      await user.click(portfolioLink)

      // Verify PortfolioPage renders
      const portfolioPage = screen.getByTestId('portfolio-page')
      expect(portfolioPage).toBeInTheDocument()
    })
  })

  describe('Portfolio Page Structure', () => {
    it('should render summary cards with responsive grid', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Navigate to portfolio
      const nav = screen.getAllByRole('navigation')[0]
      const portfolioLink = within(nav).getByText('Portfolio')
      await user.click(portfolioLink)

      // Check for responsive grid classes
      const portfolioPage = screen.getByTestId('portfolio-page')
      const grid = portfolioPage.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })
  })
})
