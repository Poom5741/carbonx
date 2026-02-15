import React, { useEffect } from 'react'
import { Button } from '../ui/button'

const TOUR_STORAGE_KEY = 'blockedge-tour-completed'

export interface TourStep {
  title: string
  description: string
  target: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to Blockedge Exchange',
    description: 'Your next-generation carbon credit trading platform. Let us show you around the key features.',
    target: '', // Center overlay doesn't need a target
    position: 'center'
  },
  {
    title: 'Navigation Bar',
    description: 'Access all main features from here. Trade carbon credits, view markets, and track your portfolio portfolio.',
    target: 'navbar',
    position: 'bottom'
  },
  {
    title: 'Trading Interface',
    description: 'Place buy and sell orders with real-time pricing. Our order book shows live market depth.',
    target: 'trade',
    position: 'left'
  },
  {
    title: 'Portfolio Overview',
    description: 'Track your holdings, view performance charts, and monitor open orders all in one place.',
    target: 'portfolio',
    position: 'left'
  },
  {
    title: 'Markets Page',
    description: 'Browse all available carbon credit projects with detailed metrics and historical data.',
    target: 'markets',
    position: 'left'
  }
]

export interface OnboardingTourProps {
  isOpen: boolean
  currentStep: number
  onNext: () => void
  onSkip: () => void
  onPrevious?: () => void
  onFinish?: () => void
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  currentStep,
  onNext,
  onSkip,
  onPrevious,
  onFinish
}) => {
  const step = tourSteps[currentStep] || tourSteps[0]
  const isLastStep = currentStep === tourSteps.length - 1
  const isFirstStep = currentStep === 0

  // Mark tour as completed when skipped or finished
  useEffect(() => {
    return () => {
      // Cleanup - mark as completed if user closes tour
      if (isLastStep) {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true')
      }
    }
  }, [isLastStep])

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    onSkip()
  }

  const handleFinish = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    onFinish?.()
  }

  const handleNext = () => {
    if (isLastStep) {
      handleFinish()
    } else {
      onNext()
    }
  }

  if (!isOpen) return null

  return (
    <div data-testid="onboarding-tour" className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
        data-testid="tour-backdrop"
      />

      {/* Tooltip */}
      <div
        className="relative z-10 w-full max-w-md bg-[#1a2332] border border-gray-700 rounded-2xl shadow-2xl p-6 mx-4 animate-in fade-in zoom-in duration-300"
        data-testid="tour-tooltip"
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-6 bg-[#40ffa9]'
                    : index < currentStep
                    ? 'w-1.5 bg-[#40ffa9]/50'
                    : 'w-1.5 bg-gray-700'
                }`}
                data-testid={`progress-dot-${index}`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Skip tour"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2" data-testid="tour-title">
            {step.title}
          </h3>
          <p className="text-gray-400 leading-relaxed" data-testid="tour-description">
            {step.description}
          </p>
        </div>

        {/* Step indicator */}
        <div className="text-xs text-gray-500 mb-4" data-testid="step-indicator">
          Step {currentStep + 1} of {tourSteps.length}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {!isFirstStep ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="text-gray-400 hover:text-white"
              data-testid="previous-button"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-300"
              data-testid="skip-button"
            >
              Skip tour
            </Button>
          )}

          <Button
            onClick={handleNext}
            className="bg-[#40ffa9] text-black hover:bg-[#34cc8a] font-medium"
            data-testid="next-button"
          >
            {isLastStep ? (
              <>Get Started</>
            ) : (
              <>
                Next
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Utility function to check if user has completed the tour
export function hasCompletedTour(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(TOUR_STORAGE_KEY) === 'true'
}

// Utility function to reset tour (for testing or "Show me again" feature)
export function resetTour(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOUR_STORAGE_KEY)
}

// Hook for managing tour state
export function useOnboardingTour() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)

  React.useEffect(() => {
    // Auto-open tour if user hasn't completed it
    if (!hasCompletedTour()) {
      // Small delay to let page load
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsOpen(false)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skip = () => {
    setIsOpen(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  }

  const finish = () => {
    setIsOpen(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  }

  const restart = () => {
    resetTour()
    setCurrentStep(0)
    setIsOpen(true)
  }

  return {
    isOpen,
    currentStep,
    nextStep,
    previousStep,
    skip,
    finish,
    restart,
    tourSteps,
    hasCompleted: hasCompletedTour()
  }
}
