import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Import will fail initially - component doesn't exist yet
import { PortfolioPage } from './PortfolioPage'

// Mock useTrading hook
vi.mock('@/hooks/useTrading', () => ({
  useTrading: vi.fn(() => ({
    orders: [],
    portfolio: {
      balance: 10000,
      holdings: {
        'REC': { amount: 150, currentPrice: 46.80 },
        'TVER': { amount: 500, currentPrice: 12.80 },
        'CER': { amount: 200, currentPrice: 44.30 }
      }
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

describe('PortfolioPage - Component Structure', () => {
  it('should render portfolio page container', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByTestId('portfolio-page')).toBeInTheDocument()
  })

  it('should render page title with "Portfolio"', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByRole('heading', { name: /portfolio overview/i })).toBeInTheDocument()
  })

  it('should render 4 summary cards', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByTestId('total-balance-card')).toBeInTheDocument()
    expect(screen.getByTestId('total-assets-card')).toBeInTheDocument()
    expect(screen.getByTestId('daily-pnl-card')).toBeInTheDocument()
    expect(screen.getByTestId('pending-orders-card')).toBeInTheDocument()
  })

  it('should render holdings section', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByTestId('holdings-section')).toBeInTheDocument()
  })

  it('should render open orders section', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByTestId('open-orders-section')).toBeInTheDocument()
  })
})

describe('PortfolioPage - Holdings Data', () => {
  it('should display REC holding with correct data', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByText('REC')).toBeInTheDocument()
    // Amount is 150.00 with two decimal places
    expect(screen.getByText('150.00')).toBeInTheDocument()
    // Value is rendered as "$7020.00" - use flexible text matcher
    expect(screen.getByText((content) => content.includes('7020'))).toBeInTheDocument()
    // Use within to query specifically in holdings section
    const holdingsSection = screen.getByTestId('holdings-section')
    // REC price is 46.80 which is +4.0% from 45
    expect(within(holdingsSection).getByText((content) => content.includes('+4.0%'))).toBeInTheDocument()
  })

  it('should display all required holdings', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByText('TVER')).toBeInTheDocument()
    expect(screen.getByText('CER')).toBeInTheDocument()
  })

  it('should calculate correct value for holdings', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    // REC: 150 * $46.80 = $7,020
    expect(screen.getByText((content) => content.includes('7020'))).toBeInTheDocument()
    // TVER: 500 * $12.80 = $6,400
    expect(screen.getByText((content) => content.includes('6400'))).toBeInTheDocument()
  })

  it('should show positive change in green', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    // Find within holdings table specifically
    const holdingsSection = screen.getByTestId('holdings-section')
    // REC price is 46.80 which is +4.0% from 45
    const positiveChange = within(holdingsSection).getByText((content) => content.includes('+4.0%'))
    expect(positiveChange).toHaveClass('text-green-400')
  })

  it('should show negative change in red', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    const holdingsSection = screen.getByTestId('holdings-section')
    // CER has currentPrice of 44.30, so change is (44.30 - 45) / 45 * 100 = -1.55...%
    // We look for -1.6% or -1.5% rounded
    const negativeChange = within(holdingsSection).getByText((content) => content.includes('-1.6%') || content.includes('-1.5%'))
    expect(negativeChange).toHaveClass('text-red-400')
  })
})
