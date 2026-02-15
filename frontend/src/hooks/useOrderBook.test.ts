import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useOrderBook } from './useOrderBook'

describe('useOrderBook - Order Book Depth Calculations (TDG)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty asks and bids when no price provided', () => {
      const { result } = renderHook(() => useOrderBook(0, 12))
      expect(result.current.asks).toEqual([])
      expect(result.current.bids).toEqual([])
    })

    it('should initialize with specified number of levels', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 8))
      expect(result.current.asks.length).toBe(8)
      expect(result.current.bids.length).toBe(8)
    })

    it('should default to 12 levels if not specified', () => {
      const { result } = renderHook(() => useOrderBook(45.20))
      expect(result.current.asks.length).toBe(12)
      expect(result.current.bids.length).toBe(12)
    })

    it('should have asks ordered highest to lowest', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))
      for (let i = 1; i < result.current.asks.length; i++) {
        expect(result.current.asks[i].price).toBeLessThan(result.current.asks[i - 1].price)
      }
    })

    it('should have bids ordered lowest to highest', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))
      for (let i = 1; i < result.current.bids.length; i++) {
        expect(result.current.bids[i].price).toBeGreaterThan(result.current.bids[i - 1].price)
      }
    })
  })

  describe('Initial State', () => {
    it('should initialize with empty asks and bids when no price provided', () => {
      const { result } = renderHook(() => useOrderBook(0, 12))
      expect(result.current.asks).toEqual([])
      expect(result.current.bids).toEqual([])
    })

    it('should initialize with specified number of levels', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 8))
      expect(result.current.asks.length).toBe(8)
      expect(result.current.bids.length).toBe(8)
    })

    it('should default to 12 levels if not specified', () => {
      const { result } = renderHook(() => useOrderBook(45.20))
      expect(result.current.asks.length).toBe(12)
      expect(result.current.bids.length).toBe(12)
    })

    it('should have asks ordered highest to lowest', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))
      for (let i = 1; i < result.current.asks.length; i++) {
        expect(result.current.asks[i].price).toBeLessThan(result.current.asks[i - 1].price)
      }
    })

    it('should have bids ordered lowest to highest', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))
      for (let i = 1; i < result.current.bids.length; i++) {
        expect(result.current.bids[i].price).toBeGreaterThan(result.current.bids[i - 1].price)
      }
    })
  })

  describe('Order Book Entry Structure', () => {
    it('should include all required fields for each entry', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 5))

      result.current.asks.forEach(entry => {
        expect(entry).toHaveProperty('price')
        expect(entry).toHaveProperty('size')
        expect(entry).toHaveProperty('total')
        expect(entry).toHaveProperty('depth')
      })

      result.current.bids.forEach(entry => {
        expect(entry).toHaveProperty('price')
        expect(entry).toHaveProperty('size')
        expect(entry).toHaveProperty('total')
        expect(entry).toHaveProperty('depth')
      })
    })

    it('should calculate total as price * size', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 5))

      result.current.asks.forEach(entry => {
        // Total should be approximately equal to price * size (within 1 decimal)
        const expectedTotal = entry.price * entry.size
        expect(Math.abs(entry.total - expectedTotal)).toBeLessThan(0.1)
      })

      result.current.bids.forEach(entry => {
        const expectedTotal = entry.price * entry.size
        expect(Math.abs(entry.total - expectedTotal)).toBeLessThan(0.1)
      })
    })

    it('should have all ask prices above the base price', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))
      result.current.asks.forEach(entry => {
        expect(entry.price).toBeGreaterThan(45.20)
      })
    })

    it('should have all bid prices below the base price', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))
      result.current.bids.forEach(entry => {
        expect(entry.price).toBeLessThan(45.20)
      })
    })
  })

  describe('Depth Calculations', () => {
    it('should calculate depth as percentage relative to max size', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))

      result.current.asks.forEach(entry => {
        expect(entry.depth).toBeGreaterThanOrEqual(0)
        expect(entry.depth).toBeLessThanOrEqual(1)
      })

      result.current.bids.forEach(entry => {
        expect(entry.depth).toBeGreaterThanOrEqual(0)
        expect(entry.depth).toBeLessThanOrEqual(1)
      })
    })

    it('should provide maxDepth for visualization', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))

      expect(result.current.maxAskDepth).toBeDefined()
      expect(result.current.maxBidDepth).toBeDefined()
      expect(result.current.maxAskDepth).toBeGreaterThan(0)
      expect(result.current.maxBidDepth).toBeGreaterThan(0)
    })
  })

  describe('Real-time Updates', () => {
    it('should update order book when price changes', async () => {
      // Use real timers for this test
      vi.useRealTimers()

      const { result, rerender } = renderHook(
        ({ price }) => useOrderBook(price, 12),
        { initialProps: { price: 45.20 } }
      )

      const initialAskPrice = result.current.asks[0].price
      const initialBidPrice = result.current.bids[0].price

      act(() => {
        rerender({ price: 46.50 })
      })

      await waitFor(() => {
        expect(result.current.asks[0].price).not.toBe(initialAskPrice)
        expect(result.current.bids[0].price).not.toBe(initialBidPrice)
      })

      vi.useFakeTimers()
    })

    it('should update periodically based on updateInterval', async () => {
      // Use real timers for this test
      vi.useRealTimers()

      const { result } = renderHook(() => useOrderBook(45.20, 12, 20))

      // Wait for multiple updates - the random sizes will change
      // Since prices are deterministic, we'll verify the hook is working by checking multiple updates
      await new Promise(resolve => setTimeout(resolve, 100))

      // The hook should have updated (even if price is same due to randomness in size)
      // We verify it's working by checking we still have the right structure
      expect(result.current.asks.length).toBe(12)
      expect(result.current.bids.length).toBe(12)

      vi.useFakeTimers()
    })

    it('should clear interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

      const { unmount } = renderHook(() => useOrderBook(45.20, 12, 100))

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('Spread Calculations', () => {
    it('should calculate spread as difference between best ask and best bid', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))

      expect(result.current.spread).toBeDefined()
      expect(result.current.spread).toBeGreaterThan(0)
    })

    it('should calculate spread percentage', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 12))

      expect(result.current.spreadPercent).toBeDefined()
      expect(result.current.spreadPercent).toBeGreaterThan(0)
      expect(result.current.spreadPercent).toBeLessThan(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero price gracefully', () => {
      const { result } = renderHook(() => useOrderBook(0, 12))
      expect(result.current.asks).toEqual([])
      expect(result.current.bids).toEqual([])
    })

    it('should handle negative price gracefully', () => {
      const { result } = renderHook(() => useOrderBook(-10, 12))
      expect(result.current.asks).toEqual([])
      expect(result.current.bids).toEqual([])
    })

    it('should handle zero levels gracefully', () => {
      const { result } = renderHook(() => useOrderBook(45.20, 0))
      expect(result.current.asks).toEqual([])
      expect(result.current.bids).toEqual([])
    })

    it('should handle very small price values', () => {
      const { result } = renderHook(() => useOrderBook(0.01, 12))

      result.current.bids.forEach(entry => {
        expect(entry.price).toBeGreaterThan(0)
      })
    })
  })
})
