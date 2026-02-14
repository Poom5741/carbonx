import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

describe('App - Routes Standardization', () => {
  describe('Route structure', () => {
    it('should have /trade route but not /trading', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>,
      )

      // Should have /trade route
      expect(screen.getByText(/trade/i)).toBeInTheDocument()

      // Should NOT have /trading route (crashes the app)
      expect(screen.queryByText(/trading/i)).not.toBeInTheDocument()
    })
  })

  describe('Navigation links', () => {
    it('Navbar should link to /trade correctly', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>,
      )

      const tradingLinks = screen.getAllByText(/trade/i)
      expect(tradingLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Page component consistency', () => {
    it('TradingPage should use input-trade class not input-trading', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>,
      )

      // Navigate to /trade
      const tradeLink = screen.getByText(/trade/i)
      tradeLink.click()

      // Check for input-trade class (not input-trading)
      const tradingInput = screen.queryByTestId(/input-trading/i)
      expect(tradingInput).not.toBeInTheDocument()
    })
  })
})
