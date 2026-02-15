import React, { useEffect, useState, useRef } from 'react'

export interface PriceFlashCellProps {
  price: number
  previousPrice?: number
  className?: string
}

/**
 * PriceFlashCell - Displays price with flash animation on change
 *
 * Features:
 * - Green flash (#40ffa9) for price increase
 * - Red flash (#ff6b6b) for price decrease
 * - Animation duration: ~500ms
 * - Monospace font (font-mono) for numbers
 */
export const PriceFlashCell: React.FC<PriceFlashCellProps> = ({
  price,
  previousPrice,
  className = ''
}) => {
  const [flashDirection, setFlashDirection] = useState<'up' | 'down' | null>(() => {
    // Set initial flash direction based on price vs previousPrice
    if (previousPrice !== undefined) {
      if (price > previousPrice) return 'up'
      if (price < previousPrice) return 'down'
    }
    return null
  })
  const [displayPrice, setDisplayPrice] = useState(price)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Skip first render since we initialize in useState
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true

      // Clear flash after animation completes for initial flash
      if (flashDirection !== null) {
        animationTimeoutRef.current = setTimeout(() => {
          setFlashDirection(null)
        }, 500)
      }
      return
    }

    // Update display price when price prop changes
    if (price !== displayPrice) {
      setDisplayPrice(price)

      // Determine flash direction if previousPrice is provided
      if (previousPrice !== undefined) {
        if (price > previousPrice) {
          setFlashDirection('up')
        } else if (price < previousPrice) {
          setFlashDirection('down')
        }

        // Clear flash after animation completes
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current)
        }
        animationTimeoutRef.current = setTimeout(() => {
          setFlashDirection(null)
        }, 500)
      }
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [price, previousPrice, displayPrice, flashDirection])

  // Format price to 2 decimal places
  const formattedPrice = displayPrice.toFixed(2)

  return (
    <span className={className}>
      <span
        data-testid="price-flash"
        className={`
          font-mono
          transition-colors duration-200
          ${flashDirection === 'up' ? 'flash-green' : ''}
          ${flashDirection === 'down' ? 'flash-red' : ''}
        `}
      >
        {formattedPrice}
      </span>

      {/* Inline styles for flash animations */}
      <style>{`
        @keyframes flashGreen {
          0% { background-color: transparent; }
          10% { background-color: rgba(64, 255, 169, 0.3); }
          100% { background-color: transparent; }
        }

        @keyframes flashRed {
          0% { background-color: transparent; }
          10% { background-color: rgba(255, 107, 107, 0.3); }
          100% { background-color: transparent; }
        }

        .flash-green {
          animation: flashGreen 500ms ease-out;
        }

        .flash-red {
          animation: flashRed 500ms ease-out;
        }
      `}</style>
    </span>
  )
}
