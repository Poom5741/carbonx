import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { App } from './App'

describe('App - Integration Tests', () => {
  describe('Responsive Design', () => {
    it('should render navigation with responsive classes', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Check that nav exists
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()

      // Check for responsive classes
      const navContainer = nav.closest('div')
      expect(navContainer).toHaveClass('hidden', 'md:flex')
    })

    it('should render summary cards grid with responsive columns', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Navigate to portfolio
      const portfolioLink = screen.getByText('Portfolio')
      portfolioLink.click()

      // Check for responsive grid classes
      const grid = screen.getByTestId('portfolio-page').querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })
  })

  describe('Routing Integration', () => {
    it('should render PortfolioPage at /portfolio route', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Click Portfolio link
      const portfolioLink = screen.getByText('Portfolio')
      portfolioLink.click()

      // Verify PortfolioPage renders
      const portfolioPage = screen.getByTestId('portfolio-page')
      expect(portfolioPage).toBeInTheDocument()
    })

    it('should include Portfolio link in navigation', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      const portfolioLink = screen.getByText('Portfolio')
      expect(portfolioLink).toBeInTheDocument()
      expect(portfolioLink).toHaveAttribute('href', '/portfolio')
    })
  })

  describe('Navigation Flow', () => {
    it('should navigate between Trade, Markets, and Portfolio pages', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Click Trade
      await user.click(screen.getByText('Trade'))
      expect(window.location.pathname).toBe('/trade')

      // Click Markets
      await user.click(screen.getByText('Markets'))
      expect(window.location.pathname).toBe('/markets')

      // Click Portfolio
      await user.click(screen.getByText('Portfolio'))
      expect(window.location.pathname).toBe('/portfolio')
    })
  })
})
