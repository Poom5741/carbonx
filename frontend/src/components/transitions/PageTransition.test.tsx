import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageTransition } from './PageTransition'

describe('PageTransition', () => {
  it('should render children content', () => {
    render(
      <PageTransition>
        <div data-testid="test-content">Test Content</div>
      </PageTransition>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should apply transition wrapper class', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    )

    const wrapper = container.querySelector('[data-testid="page-transition"]')
    expect(wrapper).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <PageTransition>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </PageTransition>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('should apply custom className if provided', () => {
    const { container } = render(
      <PageTransition className="custom-class">
        <div>Content</div>
      </PageTransition>
    )

    const wrapper = container.querySelector('[data-testid="page-transition"]')
    expect(wrapper).toHaveClass('custom-class')
  })

  it('should handle empty children gracefully', () => {
    const { container } = render(<PageTransition>{null}</PageTransition>)

    const wrapper = container.querySelector('[data-testid="page-transition"]')
    expect(wrapper).toBeInTheDocument()
  })
})
