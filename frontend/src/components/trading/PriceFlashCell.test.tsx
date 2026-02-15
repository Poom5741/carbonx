import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceFlashCell } from './PriceFlashCell'

describe('PriceFlashCell', () => {
  describe('Color Direction', () => {
    it('should apply green-flash class when price increases', () => {
      const { container } = render(
        <PriceFlashCell price={100.50} previousPrice={100.00} />
      )

      const priceElement = container.querySelector('[data-testid="price-flash"]')
      expect(priceElement).toHaveClass('flash-green')
    })

    it('should apply red-flash class when price decreases', () => {
      const { container } = render(
        <PriceFlashCell price={99.50} previousPrice={100.00} />
      )

      const priceElement = container.querySelector('[data-testid="price-flash"]')
      expect(priceElement).toHaveClass('flash-red')
    })

    it('should not apply flash class when price is the same', () => {
      const { container } = render(
        <PriceFlashCell price={100.00} previousPrice={100.00} />
      )

      const priceElement = container.querySelector('[data-testid="price-flash"]')
      expect(priceElement).not.toHaveClass('flash-green')
      expect(priceElement).not.toHaveClass('flash-red')
    })

    it('should not apply flash class when previousPrice is not provided', () => {
      const { container } = render(
        <PriceFlashCell price={100.00} />
      )

      const priceElement = container.querySelector('[data-testid="price-flash"]')
      expect(priceElement).not.toHaveClass('flash-green')
      expect(priceElement).not.toHaveClass('flash-red')
    })
  })

  describe('Price Display', () => {
    it('should display the price with proper formatting', () => {
      render(<PriceFlashCell price={1234.5678} />)

      expect(screen.getByText('1234.57')).toBeInTheDocument()
    })

    it('should use monospace font for numbers', () => {
      const { container } = render(
        <PriceFlashCell price={100.00} />
      )

      const priceElement = container.querySelector('[data-testid="price-flash"]')
      expect(priceElement).toHaveClass('font-mono')
    })
  })

  describe('Custom ClassName', () => {
    it('should apply custom className to the wrapper', () => {
      const { container } = render(
        <PriceFlashCell price={100.00} className="custom-class" />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-class')
    })
  })
})
