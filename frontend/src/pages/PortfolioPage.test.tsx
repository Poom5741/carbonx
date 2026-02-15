import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
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

// Helper to wait for initial loading to complete
const waitForLoadComplete = async () => {
  await waitFor(() => {
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
  }, { timeout: 200 })
}

describe('PortfolioPage - Component Structure', () => {
  it('should render portfolio page container', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    expect(screen.getByTestId('portfolio-page')).toBeInTheDocument()
  })

  it('should render page title with "Portfolio"', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    expect(screen.getByRole('heading', { name: /portfolio overview/i })).toBeInTheDocument()
  })

  it('should render 4 summary cards', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    expect(screen.getByTestId('total-balance-card')).toBeInTheDocument()
    expect(screen.getByTestId('total-assets-card')).toBeInTheDocument()
    expect(screen.getByTestId('daily-pnl-card')).toBeInTheDocument()
    expect(screen.getByTestId('pending-orders-card')).toBeInTheDocument()
  })

  it('should render holdings section', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    expect(screen.getByTestId('holdings-section')).toBeInTheDocument()
  })

  it('should render open orders section', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    expect(screen.getByTestId('open-orders-section')).toBeInTheDocument()
  })
})

describe('PortfolioPage - Holdings Data', () => {
  it('should display REC holding with correct data', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
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

  it('should display all required holdings', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    expect(screen.getByText('TVER')).toBeInTheDocument()
    expect(screen.getByText('CER')).toBeInTheDocument()
  })

  it('should calculate correct value for holdings', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    // REC: 150 * $46.80 = $7,020
    expect(screen.getByText((content) => content.includes('7020'))).toBeInTheDocument()
    // TVER: 500 * $12.80 = $6,400
    expect(screen.getByText((content) => content.includes('6400'))).toBeInTheDocument()
  })

  it('should show positive change in green', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    // Find within holdings table specifically
    const holdingsSection = screen.getByTestId('holdings-section')
    // REC price is 46.80 which is +4.0% from 45
    const positiveChange = within(holdingsSection).getByText((content) => content.includes('+4.0%'))
    expect(positiveChange).toHaveClass('text-green-400')
  })

  it('should show negative change in red', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    await waitForLoadComplete()
    const holdingsSection = screen.getByTestId('holdings-section')
    // CER has currentPrice of 44.30, so change is (44.30 - 45) / 45 * 100 = -1.55...%
    // We look for -1.6% or -1.5% rounded
    const negativeChange = within(holdingsSection).getByText((content) => content.includes('-1.6%') || content.includes('-1.5%'))
    expect(negativeChange).toHaveClass('text-red-400')
  })
})

// ============================================================================
// TDG RED PHASE - Task #3: Initial Load Skeleton Integration
// ============================================================================
// These tests are written FIRST and will FAIL until we implement the feature
// ============================================================================

describe('PortfolioPage - Initial Load Skeleton (TDG RED)', () => {
  it('should show loading skeleton on initial mount', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)

    // Expect loading state to be present initially (multiple LoadingState components)
    const loadingStates = screen.getAllByTestId('loading-state')
    expect(loadingStates.length).toBeGreaterThan(0)
    expect(screen.getByTestId('chart-skeleton-area')).toBeInTheDocument()
  })

  it('should show stats skeleton cards while loading', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)

    // Expect stats skeleton cards
    expect(screen.getByTestId('skeleton-stat-0')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-stat-1')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-stat-2')).toBeInTheDocument()
    expect(screen.getByTestId('skeleton-stat-3')).toBeInTheDocument()
  })

  it('should hide loading skeleton after data loads', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)

    // Initially loading
    expect(screen.getAllByTestId('loading-state').length).toBeGreaterThan(0)

    // After data loads, skeleton should be gone
    // Wait for useEffect to complete and setIsInitialLoad(false) to be called
    await vi.waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
    }, { timeout: 200 })
  })

  it('should show actual content after loading completes', async () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)

    // Wait for loading to complete
    await vi.waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
    }, { timeout: 200 })

    // Verify actual content is now visible
    expect(screen.getByTestId('portfolio-page')).toBeInTheDocument()
    expect(screen.getByTestId('total-balance-card')).toBeInTheDocument()
  })

  it('should apply fade-in animation when content loads', async () => {
    const { container } = renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)

    // Wait for loading to complete - use longer timeout to ensure state update completes
    await vi.waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
    }, { timeout: 200 })

    // Check for fade-in class on main container
    const mainContent = container.querySelector('.fade-in, .animate-in')
    expect(mainContent).toBeInTheDocument()
  })

  it('should show table skeleton for holdings while loading', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)

    // Initially should have loading states
    expect(screen.getAllByTestId('loading-state').length).toBeGreaterThan(0)
  })
})
