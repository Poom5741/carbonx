import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PortfolioHeader } from './PortfolioHeader'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('PortfolioHeader', () => {
  describe('Authentication State', () => {
    it('should show "Connect" button when user is not logged in', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(
        <PortfolioHeader isLoggedIn={false} onLoginClick={onLoginClick} />
      )

      const connectButton = screen.getByRole('button', { name: /connect/i })
      expect(connectButton).toBeInTheDocument()
    })

    it('should call onLoginClick when Connect button is clicked', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(
        <PortfolioHeader isLoggedIn={false} onLoginClick={onLoginClick} />
      )

      const connectButton = screen.getByRole('button', { name: /connect/i })
      connectButton.click()

      expect(onLoginClick).toHaveBeenCalledTimes(1)
    })

    it('should not show Connect button when user is logged in', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(
        <PortfolioHeader isLoggedIn={true} onLoginClick={onLoginClick} />
      )

      const connectButton = screen.queryByRole('button', { name: /connect/i })
      expect(connectButton).not.toBeInTheDocument()
    })
  })
})
