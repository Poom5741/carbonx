import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingTour, hasCompletedTour } from './OnboardingTour'

const TOUR_STORAGE_KEY = 'blockedge-tour-completed'

describe('OnboardingTour', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
  })

  it('should render tour when user has not completed it', () => {
    render(<OnboardingTour isOpen={true} currentStep={0} onNext={vi.fn()} onSkip={vi.fn()} />)

    expect(screen.getByTestId('onboarding-tour')).toBeInTheDocument()
  })

  it('should not render tour when isOpen is false', () => {
    render(<OnboardingTour isOpen={false} currentStep={0} onNext={vi.fn()} onSkip={vi.fn()} />)

    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument()
  })

  it('should display first step content correctly', () => {
    render(<OnboardingTour isOpen={true} currentStep={0} onNext={vi.fn()} onSkip={vi.fn()} />)

    expect(screen.getByText(/welcome to blockedge/i)).toBeInTheDocument()
    expect(screen.getByTestId('next-button')).toBeInTheDocument()
    expect(screen.getByTestId('skip-button')).toBeInTheDocument()
  })

  it('should call onNext when Next button is clicked', () => {
    const onNext = vi.fn()
    render(<OnboardingTour isOpen={true} currentStep={0} onNext={onNext} onSkip={vi.fn()} />)

    const nextButton = screen.getByTestId('next-button')
    fireEvent.click(nextButton)

    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('should call onSkip when Skip button is clicked', () => {
    const onSkip = vi.fn()
    render(<OnboardingTour isOpen={true} currentStep={0} onNext={vi.fn()} onSkip={onSkip} />)

    const skipButton = screen.getByTestId('skip-button')
    fireEvent.click(skipButton)

    expect(onSkip).toHaveBeenCalledTimes(1)
  })

  it('should mark tour as completed in localStorage when skipped', () => {
    render(<OnboardingTour isOpen={true} currentStep={0} onNext={vi.fn()} onSkip={vi.fn()} />)

    const skipButton = screen.getByTestId('skip-button')
    fireEvent.click(skipButton)

    expect(localStorage.getItem(TOUR_STORAGE_KEY)).toBe('true')
  })

  it('should show Back button on steps after the first', () => {
    render(<OnboardingTour isOpen={true} currentStep={1} onNext={vi.fn()} onSkip={vi.fn()} onPrevious={vi.fn()} />)

    expect(screen.getByTestId('previous-button')).toBeInTheDocument()
  })

  it('should show Finish button on last step', () => {
    render(<OnboardingTour isOpen={true} currentStep={4} onNext={vi.fn()} onSkip={vi.fn()} onFinish={vi.fn()} />)

    // The "Get Started" button is the next-button on last step
    expect(screen.getByTestId('next-button')).toHaveTextContent('Get Started')
  })

  it('should store completed status in localStorage', () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    expect(localStorage.getItem(TOUR_STORAGE_KEY)).toBe('true')
  })
})

describe('hasCompletedTour', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return true when tour is marked as completed', () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    expect(hasCompletedTour()).toBe(true)
  })

  it('should return false when tour is not completed', () => {
    expect(hasCompletedTour()).toBe(false)
  })
})
