import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  duration?: number
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  duration = 0.4
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Animate in
    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 20
      },
      {
        opacity: 1,
        y: 0,
        duration,
        ease: 'power2.out'
      }
    )

    // Cleanup animation on unmount
    return () => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          y: -10,
          duration: duration / 2,
          ease: 'power2.in'
        })
      }
    }
  }, [duration])

  return (
    <div
      ref={containerRef}
      data-testid="page-transition"
      className={className}
    >
      {children}
    </div>
  )
}

// Hook for route transition management
export function useRouteTransition() {
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const transitionOut = async (callback?: () => void) => {
    if (!containerRef.current) {
      callback?.()
      return
    }

    setIsTransitioning(true)

    await gsap.to(containerRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: 'power2.in'
    })

    callback?.()
  }

  const transitionIn = () => {
    if (!containerRef.current) {
      setIsTransitioning(false)
      return
    }

    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 20
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => setIsTransitioning(false)
      }
    )
  }

  return {
    containerRef,
    isTransitioning,
    transitionOut,
    transitionIn
  }
}
