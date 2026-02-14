import { describe, it, expect, vi } from 'vitest'
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

describe('PortfolioPage - Authentication State (RED)', () => {
  describe('when NOT logged in', () => {
    it('should show Connect button', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(<PortfolioPage isLoggedIn={false} onLoginClick={onLoginClick} />)

      // Connect button should be visible
      const connectButton = screen.queryByText('Connect')
      expect(connectButton).toBeInTheDocument()
    })

    it('should call onLoginClick when Connect button is clicked', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(<PortfolioPage isLoggedIn={false} onLoginClick={onLoginClick} />)

      const connectButton = screen.getByText('Connect')
      connectButton.click()

      expect(onLoginClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('when logged in', () => {
    it('should NOT show Connect button', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={onLoginClick} />)

      // Connect button should NOT be visible
      const connectButton = screen.queryByText('Connect')
      expect(connectButton).not.toBeInTheDocument()
    })

    it('should show user dropdown', () => {
      const onLoginClick = vi.fn()
      renderWithRouter(<PortfolioPage isLoggedIn={true} onLoginClick={onLoginClick} />)

      // User address should be visible
      const userAddress = screen.queryByText(/0x[a-f0-9]+\.\.\.[a-f0-9]+/i)
      expect(userAddress).toBeInTheDocument()
    })
  })
})
