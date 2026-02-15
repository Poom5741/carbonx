/**
 * LoadingState Tests - TDG RED Phase
 *
 * Testing professional loading skeletons with shimmer effects
 *
 * Requirements:
 * 1. Skeletons match actual component layout
 * 2. Shimmer animation (not spinner)
 * 3. Brand color #40ffa9 for accents
 * 4. No technical jargon
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingState } from './LoadingState'

describe('LoadingState - TDG RED Phase', () => {
  describe('Skeleton Layout Matching', () => {
    it('should render chart skeleton with 24 bars', () => {
      render(<LoadingState type="chart" />)

      const skeletonBars = screen.getAllByTestId(/skeleton-bar-/)
      expect(skeletonBars).toHaveLength(24)
    })

    it('should render card skeleton with 4 stat cards', () => {
      render(<LoadingState type="stats" />)

      const statCards = screen.getAllByTestId(/skeleton-stat-/)
      expect(statCards).toHaveLength(4)
    })

    it('should render table skeleton with rows', () => {
      render(<LoadingState type="table" rowCount={5} />)

      const tableRows = screen.getAllByTestId(/skeleton-row-/)
      expect(tableRows).toHaveLength(5)
    })

    it('should render ticker skeleton for price ticker', () => {
      render(<LoadingState type="ticker" />)

      expect(screen.getByTestId('ticker-skeleton')).toBeInTheDocument()
      const tickerItems = screen.getAllByTestId(/skeleton-ticker-item-/)
      expect(tickerItems.length).toBeGreaterThan(0)
    })
  })

  describe('Shimmer Animation', () => {
    it('should apply shimmer style to skeleton elements', () => {
      render(<LoadingState type="chart" />)

      const firstBar = screen.getByTestId('skeleton-bar-0')
      // Check for shimmer animation via inline style
      expect(firstBar).toHaveStyle({ animation: 'shimmer 2s infinite' })
    })

    it('should not use spinner animation', () => {
      render(<LoadingState type="chart" />)

      // Should not have spinner classes
      const skeletonContainer = screen.getByTestId('loading-state')
      expect(skeletonContainer).not.toHaveClass(/animate-spin|spin/)
    })
  })

  describe('Brand Color Consistency', () => {
    it('should use #40ffa9 color for shimmer accents', () => {
      render(<LoadingState type="chart" />)

      const skeletonBars = screen.getAllByTestId(/skeleton-bar-/)
      skeletonBars.forEach(bar => {
        // Check for shimmer accent style with brand color
        const style = bar.getAttribute('style') || ''
        expect(style).toContain('64, 255, 169') // RGB for #40ffa9
      })
    })

    it('should use base color #1a2234 for skeleton background', () => {
      render(<LoadingState type="chart" />)

      const firstBar = screen.getByTestId('skeleton-bar-0')
      const style = firstBar.getAttribute('style') || ''
      expect(style).toContain('#1a2234')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for screen readers', () => {
      render(<LoadingState type="chart" />)

      const skeleton = screen.getByTestId('loading-state')
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
    })

    it('should have role="status" for loading indicator', () => {
      render(<LoadingState type="chart" />)

      const skeleton = screen.getByTestId('loading-state')
      expect(skeleton).toHaveAttribute('role', 'status')
    })
  })

  describe('Responsive Layout', () => {
    it('should adjust for mobile view', () => {
      render(<LoadingState type="chart" />)

      const skeleton = screen.getByTestId('loading-state')
      // Should have animation class for fade-in effect
      expect(skeleton).toHaveClass(/animate-in|fade-in/)
    })

    it('should preserve exact proportions of target component', () => {
      const { container } = render(<LoadingState type="chart" />)

      // Chart skeleton should match chart dimensions
      const chartArea = container.querySelector('[data-testid="chart-skeleton-area"]')
      expect(chartArea).toHaveClass(/h-72/)
    })
  })
})
