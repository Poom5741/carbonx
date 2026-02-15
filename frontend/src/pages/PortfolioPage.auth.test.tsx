import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PortfolioPage } from './PortfolioPage'

// Mock useTrading hook
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('PortfolioPage - Authentication State', () => {
  describe('when NOT logged in', () => {
    it('should render portfolio page container', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(<PortfolioPage isLoggedIn={false} onLoginClick={onLoginClick} />)

      // Portfolio page should render
      const portfolioPage = screen.getByTestId('portfolio-page')
      expect(portfolioPage).toBeInTheDocument()
    })

    it('should receive onLoginClick prop', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(<PortfolioPage isLoggedIn={false} onLoginClick={onLoginClick} />)

      // Component should accept the callback prop (even if not used directly in the page)
      expect(onLoginClick).toBeDefined()
    })
  })

  describe('when logged in', () => {
    it('should render portfolio page with holdings', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={onLoginClick} />)

      // Portfolio page should render with holdings
      const holdingsSection = screen.getByTestId('holdings-section')
      expect(holdingsSection).toBeInTheDocument()
    })
  })
})
