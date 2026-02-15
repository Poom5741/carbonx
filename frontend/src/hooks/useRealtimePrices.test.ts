import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRealtimePrices } from './useRealtimePrices'

describe('useRealtimePrices - Real-time Price Updates (TDG)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with all trading pairs', () => {
      const { result } = renderHook(() => useRealtimePrices(5000))

      expect(result.current.length).toBe(6)

      const symbols = result.current.map(p => p.symbol)
      expect(symbols).toContain('REC/USDT')
      expect(symbols).toContain('TVER/USDT')
      expect(symbols).toContain('TVER-P/USDT')
      expect(symbols).toContain('I-REC/USDT')
      expect(symbols).toContain('CER/USDT')
      expect(symbols).toContain('VCU/USDT')
    })

    it('should initialize with base prices', () => {
      const { result } = renderHook(() => useRealtimePrices(5000))

      const recPrice = result.current.find(p => p.symbol === 'REC/USDT')
      expect(recPrice?.price).toBeCloseTo(45.20, 1)
    })

    it('should have previousPrice equal to price on initial render', () => {
      const { result } = renderHook(() => useRealtimePrices(5000))

      result.current.forEach(market => {
        expect(market.previousPrice).toBe(market.price)
      })
    })
  })

  describe('Price Updates', () => {
    it('should update prices over time', async () => {
      // Use real timers for this test
      vi.useRealTimers()

      const { result } = renderHook(() => useRealtimePrices(50))

      const initialPrice = result.current[0].price

      // Wait for updates
      await new Promise(resolve => setTimeout(resolve, 150))

      await waitFor(() => {
        expect(result.current[0].price).not.toBe(initialPrice)
      })

      vi.useFakeTimers()
    })

    it('should track previousPrice for flash comparison', async () => {
      // Use real timers for this test
      vi.useRealTimers()

      const { result } = renderHook(() => useRealtimePrices(50))

      const initialPrice = result.current[0].price

      // Wait for updates
      await new Promise(resolve => setTimeout(resolve, 150))

      await waitFor(() => {
        const market = result.current[0]
        expect(market.previousPrice).toBe(initialPrice)
        expect(market.price).not.toBe(initialPrice)
      })

      vi.useFakeTimers()
    })

    it('should update high24h and low24h based on price movements', async () => {
      // Use real timers for this test
      vi.useRealTimers()

      const { result } = renderHook(() => useRealtimePrices(20))

      const initialHigh = result.current[0].high24h
      const initialLow = result.current[0].low24h

      // Wait for multiple updates
      await new Promise(resolve => setTimeout(resolve, 200))

      await waitFor(() => {
        const market = result.current[0]
        // High should not decrease, low should not increase
        expect(market.high24h).toBeGreaterThanOrEqual(initialHigh)
        expect(market.low24h).toBeLessThanOrEqual(initialLow)
      })

      vi.useFakeTimers()
    })
  })

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = renderHook(() => useRealtimePrices(100))

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('Market Data Structure', () => {
    it('should include all required fields', () => {
      const { result } = renderHook(() => useRealtimePrices(5000))

      result.current.forEach(market => {
        expect(market).toHaveProperty('symbol')
        expect(market).toHaveProperty('name')
        expect(market).toHaveProperty('price')
        expect(market).toHaveProperty('previousPrice')
        expect(market).toHaveProperty('change24h')
        expect(market).toHaveProperty('volume24h')
        expect(market).toHaveProperty('high24h')
        expect(market).toHaveProperty('low24h')
      })
    })

    it('should have valid market names', () => {
      const { result } = renderHook(() => useRealtimePrices(5000))

      const rec = result.current.find(p => p.symbol === 'REC/USDT')
      expect(rec?.name).toBe('Renewable Energy Certificate')
    })
  })
})
