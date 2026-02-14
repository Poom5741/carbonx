import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Import will fail initially - component doesn't exist yet
import { PortfolioPage } from './PortfolioPage'

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
    expect(screen.getByText('150')).toBeInTheDocument()
    // Value is rendered as "$7020.00" - use flexible text matcher
    expect(screen.getByText((content) => content.includes('7020'))).toBeInTheDocument()
    // Use within to query specifically in holdings section
    const holdingsSection = screen.getByTestId('holdings-section')
    expect(within(holdingsSection).getByText((content) => content.includes('+2.4%'))).toBeInTheDocument()
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
    const positiveChange = within(holdingsSection).getByText((content) => content.includes('+2.4%'))
    expect(positiveChange).toHaveClass('text-green-400')
  })

  it('should show negative change in red', () => {
    renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={() => {}} />)
    const holdingsSection = screen.getByTestId('holdings-section')
    const negativeChange = within(holdingsSection).getByText((content) => content.includes('-1.2%'))
    expect(negativeChange).toHaveClass('text-red-400')
  })
})
