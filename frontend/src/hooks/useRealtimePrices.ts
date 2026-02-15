import { useState, useEffect, useCallback, useRef } from 'react'

export interface MarketPrice {
  symbol: string
  name: string
  price: number
  previousPrice: number
  change24h: number
  volume24h: string
  high24h: number
  low24h: number
}

const BASE_PRICES: Record<string, number> = {
  'REC/USDT': 45.20,
  'TVER/USDT': 12.80,
  'TVER-P/USDT': 18.50,
  'I-REC/USDT': 52.40,
  'CER/USDT': 8.35,
  'VCU/USDT': 6.75
}

const MARKET_NAMES: Record<string, string> = {
  'REC/USDT': 'Renewable Energy Certificate',
  'TVER/USDT': 'Thailand Voluntary Emission',
  'TVER-P/USDT': 'TVER Premium',
  'I-REC/USDT': 'International REC',
  'CER/USDT': 'Certified Emission Reduction',
  'VCU/USDT': 'Verified Carbon Unit'
}

const generateVolume = (base: number): string => {
  const multiplier = Math.floor(Math.random() * 1000)
  return `${(base * multiplier / 1000).toFixed(1)}K`
}

/**
 * useRealtimePrices - Simulates real-time price updates for trading pairs
 *
 * Features:
 * - Updates prices every 1-3 seconds
 * - Returns current and previous prices for flash comparison
 * - Includes cleanup on unmount
 */
export function useRealtimePrices(updateInterval: number = 2000) {
  const [prices, setPrices] = useState<MarketPrice[]>(() =>
    Object.entries(BASE_PRICES).map(([symbol, price]) => ({
      symbol,
      name: MARKET_NAMES[symbol],
      price,
      previousPrice: price,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: generateVolume(price),
      high24h: price * 1.05,
      low24h: price * 0.95
    }))
  )

  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  // Function to generate price variation
  const varyPrice = useCallback((basePrice: number): number => {
    const variation = (Math.random() - 0.5) * basePrice * 0.02 // ±1% variation
    return Math.max(0.01, basePrice + variation)
  }, [])

  // Update prices
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPrices(prev =>
        prev.map(market => {
          const newPrice = varyPrice(market.price)

          // Update 24h change occasionally
          const newChange24h = Math.random() > 0.7
            ? ((newPrice - BASE_PRICES[market.symbol]) / BASE_PRICES[market.symbol]) * 100
            : market.change24h

          return {
            ...market,
            previousPrice: market.price,
            price: newPrice,
            change24h: newChange24h,
            high24h: Math.max(market.high24h, newPrice),
            low24h: Math.min(market.low24h, newPrice)
          }
        })
      )
    }, updateInterval + Math.random() * 1000) // Add randomness to interval

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [updateInterval, varyPrice])

  return prices
}
