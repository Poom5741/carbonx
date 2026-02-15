import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HourlyMatchingChart } from './HourlyMatchingChart'

// Mock GSAP - must be done with factory function due to hoisting
vi.mock('gsap', () => ({
  default: {
    timeline: vi.fn(() => ({
      to: vi.fn(),
      from: vi.fn(),
      play: vi.fn(),
    })),
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
  },
  ScrollTrigger: {},
}))

const mockData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  generation: Math.random() * 100,
  consumption: Math.random() * 100,
  matched: Math.random() > 0.3,
  certificateId: `CERT-${i}`,
}))

describe('HourlyMatchingChart', () => {
  it('should render the chart container', () => {
    render(<HourlyMatchingChart data={mockData} />)

    expect(screen.getByTestId('hourly-matching-chart')).toBeInTheDocument()
  })

  it('should display all 24 hours', () => {
    render(<HourlyMatchingChart data={mockData} />)

    mockData.forEach((_, i) => {
      expect(screen.getByTestId(`hour-bar-${i}`)).toBeInTheDocument()
    })
  })

  it('should apply green color to matched hours', () => {
    render(<HourlyMatchingChart data={mockData} />)

    const matchedBars = mockData
      .filter(h => h.matched)
      .map(h => screen.getByTestId(`hour-bar-${h.hour}`))

    matchedBars.forEach(bar => {
      expect(bar).toHaveClass('bg-[#40ffa9]')
    })
  })

  it('should apply gray color to unmatched hours', () => {
    render(<HourlyMatchingChart data={mockData} />)

    const unmatchedBars = mockData
      .filter(h => !h.matched)
      .map(h => screen.getByTestId(`hour-bar-${h.hour}`))

    unmatchedBars.forEach(bar => {
      expect(bar).toHaveClass('bg-gray-600')
    })
  })

  it('should show generation and consumption values on hover', () => {
    render(<HourlyMatchingChart data={mockData} />)

    const firstBar = screen.getByTestId('hour-bar-0')
    expect(firstBar).toHaveAttribute('data-generation')
    expect(firstBar).toHaveAttribute('data-consumption')
    expect(firstBar).toHaveAttribute('data-matched')
  })

  it('should display time period selector', () => {
    render(<HourlyMatchingChart data={mockData} />)

    expect(screen.getByTestId('time-selector')).toBeInTheDocument()
    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
  })

  it('should handle time period changes', () => {
    const onPeriodChange = vi.fn()
    render(<HourlyMatchingChart data={mockData} onPeriodChange={onPeriodChange} />)

    const weekButton = screen.getByText('Week')
    weekButton.click()

    expect(onPeriodChange).toHaveBeenCalledWith('week')
  })

  it('should show loading state', () => {
    render(<HourlyMatchingChart data={mockData} loading={true} />)

    // Multiple skeleton elements are rendered during loading
    expect(screen.getAllByTestId('chart-skeleton')).toHaveLength(3)
  })

  it('should display legend', () => {
    render(<HourlyMatchingChart data={mockData} />)

    expect(screen.getByText('Matched')).toBeInTheDocument()
    expect(screen.getByText('Unmatched')).toBeInTheDocument()
  })

  it('should scale bar heights correctly', () => {
    const { container } = render(<HourlyMatchingChart data={mockData} />)

    const bars = container.querySelectorAll('[data-testid^="hour-bar-"]')
    bars.forEach(bar => {
      const height = bar.getAttribute('data-height')
      expect(height).toBeDefined()
      const heightNum = parseFloat(height || '0')
      expect(heightNum).toBeGreaterThanOrEqual(0)
      expect(heightNum).toBeLessThanOrEqual(100)
    })
  })

  it('should display hour labels', () => {
    render(<HourlyMatchingChart data={mockData} />)

    // Check for key hour labels (0, 6, 12, 18)
    expect(screen.getByText('00:00')).toBeInTheDocument()
    expect(screen.getByText('06:00')).toBeInTheDocument()
    expect(screen.getByText('12:00')).toBeInTheDocument()
    expect(screen.getByText('18:00')).toBeInTheDocument()
  })
})
