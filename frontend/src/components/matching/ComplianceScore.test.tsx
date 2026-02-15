import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComplianceScore } from './ComplianceScore'

// Mock GSAP - must be done with factory function due to hoisting
vi.mock('gsap', () => ({
  default: {
    to: vi.fn(({ onUpdate }) => {
      // Simulate animation completing immediately for tests
      // Call onUpdate synchronously to set the animated value
      if (onUpdate) {
        onUpdate()
      }
      return { kill: vi.fn() }
    }),
    fromTo: vi.fn(),
    from: vi.fn(),
    set: vi.fn(),
  },
}))

describe('ComplianceScore', () => {
  it('should render the compliance score component', () => {
    render(<ComplianceScore cfePercentage={75} />)

    expect(screen.getByTestId('compliance-score')).toBeInTheDocument()
  })

  it('should display the percentage', () => {
    render(<ComplianceScore cfePercentage={75} />)

    // The animated value starts at 0 but updates immediately due to mock
    const percentageText = screen.getByText(/\d+%/)
    expect(percentageText).toBeInTheDocument()
  })

  it('should show compliant status for CFE >= 70%', () => {
    render(<ComplianceScore cfePercentage={75} />)

    expect(screen.getByText('CFE Compliant')).toBeInTheDocument()
  })

  it('should show non-compliant status for CFE < 70%', () => {
    render(<ComplianceScore cfePercentage={50} />)

    expect(screen.getByText('Below Target')).toBeInTheDocument()
  })

  it('should show excellent status for CFE >= 90%', () => {
    render(<ComplianceScore cfePercentage={95} />)

    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('should show near target status for CFE close to threshold', () => {
    render(<ComplianceScore cfePercentage={65} targetThreshold={70} />)

    expect(screen.getByText('Near Target')).toBeInTheDocument()
  })

  it('should display matched hours count', () => {
    render(<ComplianceScore cfePercentage={75} matchedHours={18} />)

    expect(screen.getByText('18h')).toBeInTheDocument()
  })

  it('should display total energy matched', () => {
    render(<ComplianceScore cfePercentage={75} totalEnergy={450.5} />)

    expect(screen.getByText('450.5')).toBeInTheDocument()
  })

  it('should show location info', () => {
    render(<ComplianceScore cfePercentage={75} location="WHA Vietnam, Phase 3" />)

    expect(screen.getByText('WHA Vietnam, Phase 3')).toBeInTheDocument()
  })

  it('should render circular progress indicator', () => {
    const { container } = render(<ComplianceScore cfePercentage={75} />)

    const progressCircle = container.querySelector('[data-testid="progress-circle"]')
    expect(progressCircle).toBeInTheDocument()
  })

  it('should have animate attribute when enabled', () => {
    const { container } = render(<ComplianceScore cfePercentage={75} animate={true} />)

    const progressCircle = container.querySelector('[data-testid="progress-circle"]')
    expect(progressCircle).toHaveAttribute('data-animate', 'true')
  })

  it('should not have animate attribute when disabled', () => {
    const { container } = render(<ComplianceScore cfePercentage={75} animate={false} />)

    const progressCircle = container.querySelector('[data-testid="progress-circle"]')
    expect(progressCircle).toHaveAttribute('data-animate', 'false')
  })

  it('should show target threshold', () => {
    render(<ComplianceScore cfePercentage={75} targetThreshold={70} />)

    expect(screen.getByText('70%')).toBeInTheDocument()
  })

  it('should display I-REC badge', () => {
    render(<ComplianceScore cfePercentage={75} iRecCompatible={true} />)

    expect(screen.getByText('I-REC')).toBeInTheDocument()
  })

  it('should not display I-REC badge when not compatible', () => {
    render(<ComplianceScore cfePercentage={75} iRecCompatible={false} />)

    expect(screen.queryByText('I-REC')).not.toBeInTheDocument()
  })

  it('should handle 0% CFE', () => {
    render(<ComplianceScore cfePercentage={0} />)

    expect(screen.getByText('Below Target')).toBeInTheDocument()
  })

  it('should handle 100% CFE', () => {
    render(<ComplianceScore cfePercentage={100} />)

    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })
})
