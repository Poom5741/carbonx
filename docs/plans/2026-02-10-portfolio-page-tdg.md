# TDG Plan: Portfolio Page Implementation

## Overview
Test-Driven Generation plan for implementing the Portfolio page at `/portfolio` displaying carbon credit holdings and assets.

## Prerequisites

### Setup Testing Infrastructure
```bash
cd frontend && pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

### Create Vitest Config
File: `frontend/vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Create Vitest Setup
File: `frontend/src/vitest.setup.ts`
```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

### Update package.json Scripts
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

---

## TDG Cycle 1: Portfolio Page Component Structure

### RED Phase - Write Failing Tests

**Test File:** `frontend/src/pages/PortfolioPage.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PortfolioPage } from './PortfolioPage'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('PortfolioPage - Component Structure', () => {
  it('should render the portfolio page container', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByTestId('portfolio-page')).toBeInTheDocument()
  })

  it('should render page title with "Portfolio"', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByText(/portfolio/i)).toBeInTheDocument()
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
```

### GREEN Phase - Implement to Pass Tests

**Implementation File:** `frontend/src/pages/PortfolioPage.tsx`

```typescript
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface PortfolioPageProps {
  isLoggedIn: boolean
  onLoginClick: () => void
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ isLoggedIn, onLoginClick }) => {
  const navLinks = [
    { name: 'Trade', path: '/trade' },
    { name: 'Markets', path: '/markets' },
    { name: 'Portfolio', path: '/portfolio' },
  ]

  return (
    <div data-testid="portfolio-page" className="min-h-screen bg-[#0a0e17]">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-white">
            CarbonX
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          {!isLoggedIn && (
            <button
              onClick={onLoginClick}
              className="px-6 py-2 bg-[#40ffa9] text-black font-semibold rounded-lg hover:bg-[#34cc87] transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Portfolio <span className="text-[#40ffa9]">Overview</span>
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div data-testid="total-balance-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <p className="text-2xl font-bold text-white mt-2">$12,450.00</p>
          </div>
          <div data-testid="total-assets-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Assets</p>
            <p className="text-2xl font-bold text-white mt-2">6</p>
          </div>
          <div data-testid="daily-pnl-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">24h P&L</p>
            <p className="text-2xl font-bold text-green-400 mt-2">+2.4%</p>
          </div>
          <div data-testid="pending-orders-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Pending Orders</p>
            <p className="text-2xl font-bold text-white mt-2">3</p>
          </div>
        </div>

        {/* Holdings Section */}
        <div data-testid="holdings-section" className="bg-[#111827] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 py-3 px-4">Asset</th>
                  <th className="text-left text-gray-400 py-3 px-4">Amount</th>
                  <th className="text-left text-gray-400 py-3 px-4">Value (USDT)</th>
                  <th className="text-left text-gray-400 py-3 px-4">24h Change</th>
                  <th className="text-left text-gray-400 py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">REC</p>
                      <p className="text-gray-400 text-sm">Renewable Energy Certificate</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-white">150</td>
                  <td className="py-4 px-4 text-white">$7,020.00</td>
                  <td className="py-4 px-4 text-green-400">+2.4%</td>
                  <td className="py-4 px-4">
                    <button className="text-[#40ffa9] hover:underline">Trade</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Orders Section */}
        <div data-testid="open-orders-section" className="bg-[#111827] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Open Orders</h2>
          <p className="text-gray-400">No open orders</p>
        </div>
      </main>
    </div>
  )
}
```

### REFACTOR Phase
- Extract header into reusable component
- Extract summary card component
- Extract table component for reuse

---

## TDG Cycle 2: Holdings Data Display

### RED Phase - Write Failing Tests

```typescript
describe('PortfolioPage - Holdings Data', () => {
  it('should display REC holding with correct data', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByText('REC')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('$7,020.00')).toBeInTheDocument()
    expect(screen.getByText('+2.4%')).toBeInTheDocument()
  })

  it('should display all required holdings', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByText('TVER')).toBeInTheDocument()
    expect(screen.getByText('CER')).toBeInTheDocument()
  })

  it('should calculate correct value for holdings', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    // REC: 150 * $46.80 = $7,020
    expect(screen.getByText('$7,020.00')).toBeInTheDocument()
    // TVER: 500 * $12.80 = $6,400
    expect(screen.getByText('$6,400.00')).toBeInTheDocument()
  })

  it('should show positive change in green', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    const positiveChange = screen.getByText('+2.4%')
    expect(positiveChange).toHaveClass('text-green-400')
  })

  it('should show negative change in red', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    const negativeChange = screen.getByText('-1.2%')
    expect(negativeChange).toHaveClass('text-red-400')
  })
})
```

### GREEN Phase - Update Implementation

```typescript
// Add holdings data and dynamic rendering
const holdings = [
  {
    symbol: 'REC',
    name: 'Renewable Energy Certificate',
    amount: 150,
    currentPrice: 46.80,
    change24h: 2.4
  },
  {
    symbol: 'TVER',
    name: 'Thailand Voluntary Emission',
    amount: 500,
    currentPrice: 12.80,
    change24h: 5.1
  },
  {
    symbol: 'CER',
    name: 'Certified Emission Reduction',
    amount: 1000,
    currentPrice: 8.35,
    change24h: -1.2
  }
]

// In JSX: Map through holdings to create table rows
{holdings.map((holding) => (
  <tr key={holding.symbol} className="border-b border-gray-800">
    <td className="py-4 px-4">
      <div>
        <p className="text-white font-medium">{holding.symbol}</p>
        <p className="text-gray-400 text-sm">{holding.name}</p>
      </div>
    </td>
    <td className="py-4 px-4 text-white">{holding.amount}</td>
    <td className="py-4 px-4 text-white">
      ${(holding.amount * holding.currentPrice).toFixed(2)}
    </td>
    <td className={`py-4 px-4 ${holding.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(1)}%
    </td>
    <td className="py-4 px-4">
      <button className="text-[#40ffa9] hover:underline">Trade</button>
    </td>
  </tr>
))}
```

### REFACTOR Phase
- Create `HoldingsTable` component
- Add currency formatting utility
- Add percentage formatting utility

---

## TDG Cycle 3: Open Orders Display

### RED Phase - Write Failing Tests

```typescript
describe('PortfolioPage - Open Orders', () => {
  it('should display "No open orders" when orders array is empty', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByText('No open orders')).toBeInTheDocument()
  })

  it('should display order details when orders exist', () => {
    // Mock with orders data
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByTestId('orders-table')).toBeInTheDocument()
  })

  it('should render all order columns', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.getByText('Pair')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Filled')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })
})
```

### GREEN Phase - Update Implementation

```typescript
const openOrders = [
  {
    id: '1',
    pair: 'REC/USDT',
    type: 'Limit',
    side: 'Buy',
    price: 45.00,
    amount: 100,
    filled: 50
  }
]

// In Open Orders section:
{openOrders.length === 0 ? (
  <p className="text-gray-400">No open orders</p>
) : (
  <table data-testid="orders-table" className="w-full">
    {/* Table headers and rows */}
  </table>
)}
```

---

## TDG Cycle 4: Authentication State Handling

### RED Phase - Write Failing Tests

```typescript
describe('PortfolioPage - Authentication', () => {
  it('should show Connect button when not logged in', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={false} onLoginClick={() => {}} />)
    expect(screen.getByText('Connect')).toBeInTheDocument()
  })

  it('should call onLoginClick when Connect button is clicked', () => {
    const onLoginClick = vi.fn()
    renderWithRouter(<PortfolioPage isLoggedIn={false} onLoginClick={onLoginClick} />)

    const connectButton = screen.getByText('Connect')
    connectButton.click()

    expect(onLoginClick).toHaveBeenCalledTimes(1)
  })

  it('should not show Connect button when logged in', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    expect(screen.queryByText('Connect')).not.toBeInTheDocument()
  })
})
```

---

## TDG Cycle 5: Responsive Design

### RED Phase - Write Failing Tests

```typescript
describe('PortfolioPage - Responsive Design', () => {
  it('should render navigation as flex on desktop', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('hidden', 'md:flex')
  })

  it('should render summary cards as 4 columns on large screens', () => {
    const { container } = renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    const cardsContainer = container.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
    expect(cardsContainer).toBeInTheDocument()
  })
})
```

---

## Integration Tests

### File: `frontend/src/App.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

describe('Portfolio Page - Integration', () => {
  it('should render portfolio page when navigating to /portfolio', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Navigate to portfolio
    window.history.pushState({}, '', '/portfolio')

    expect(screen.getByTestId('portfolio-page')).toBeInTheDocument()
  })

  it('should include Portfolio link in navigation', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    const portfolioLink = screen.getByText('Portfolio')
    expect(portfolioLink).toBeInTheDocument()
    expect(portfolioLink.closest('a')).toHaveAttribute('href', '/portfolio')
  })
})
```

---

## Acceptance Criteria Checklist

- [ ] Portfolio page accessible at `/portfolio`
- [ ] Header displays with navigation links (Trade, Markets, Portfolio)
- [ ] Connect button shows when not logged in
- [ ] 4 summary cards display (Total Balance, Total Assets, 24h P&L, Pending Orders)
- [ ] Holdings table displays carbon credit holdings
- [ ] Holdings show: Asset, Amount, Value (USDT), 24h Change, Actions
- [ ] Positive changes display in green, negative in red
- [ ] Open Orders section displays
- [ ] Trade button links to trade page for each asset
- [ ] Responsive design works on mobile and desktop
- [ ] Styling matches existing dark theme (#0a0e17, #111827, #40ffa9)

---

## Running TDG

```bash
# Run all tests
cd frontend && pnpm test

# Run in watch mode
cd frontend && pnpm test -- --watch

# Run with coverage
cd frontend && pnpm test:coverage

# Run UI mode
cd frontend && pnpm test:ui
```

---

## Next Steps After Implementation

1. **API Integration**: Replace mock data with real API calls
2. **State Management**: Add global state for portfolio data
3. **Real-time Updates**: Add WebSocket for live price updates
4. **Additional Features**:
   - Deposit/Withdraw buttons
   - Order history
   - Trade history
   - Portfolio analytics/charts
