import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
