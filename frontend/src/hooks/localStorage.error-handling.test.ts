/**
 * localStorage Error Handling Tests (TDG RED Phase)
 *
 * These tests verify that all hooks gracefully handle localStorage errors:
 * 1. QuotaExceededError - when localStorage is full
 * 2. localStorage unavailable - when in private mode or disabled
 * 3. Corrupted data - when stored data is invalid JSON
 *
 * Pattern: try-catch with in-memory fallback
 *
 * IMPORTANT: These tests MUST FAIL initially. They document the expected behavior
 * that we will implement in the GREEN phase.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTrading } from './useTrading'
import { useHourlyMatching } from './matching/useHourlyMatching'
import { useCFECompliance } from './useCFECompliance'

describe('localStorage Error Handling (TDG RED Phase)', () => {
  let originalLocalStorage: Storage
  let mockLocalStorage: {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem: (key: string) => void
    clear: () => void
    _quotaExceeded: boolean
    _unavailable: boolean
    _corrupted: boolean
    _store: Record<string, string>
  }

  beforeEach(() => {
    // Save original localStorage
    originalLocalStorage = global.localStorage

    // Create mock localStorage that can simulate errors
    mockLocalStorage = {
      _quotaExceeded: false,
      _unavailable: false,
      _corrupted: false,
      _store: {} as Record<string, string>,

      getItem(key: string) {
        if (this._unavailable) {
          throw new Error('localStorage is not available')
        }
        if (this._corrupted && key.includes('carbonx')) {
          return 'invalid-json-{'
        }
        return this._store[key] || null
      },

      setItem(key: string, value: string) {
        if (this._unavailable) {
          throw new Error('localStorage is not available')
        }
        if (this._quotaExceeded) {
          const error = new Error('QuotaExceededError')
          error.name = 'QuotaExceededError'
          throw error
        }
        this._store[key] = value
      },

      removeItem(key: string) {
        if (this._unavailable) {
          throw new Error('localStorage is not available')
        }
        delete this._store[key]
      },

      clear() {
        this._store = {} as Record<string, string>
      }
    }

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })

    // Reset error states
    mockLocalStorage._quotaExceeded = false
    mockLocalStorage._unavailable = false
    mockLocalStorage._corrupted = false
    mockLocalStorage.clear()
  })

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    })
  })

  describe('useTrading - QuotaExceededError', () => {
    it('should gracefully handle localStorage QuotaExceededError when saving orders', async () => {
      const { result } = renderHook(() => useTrading())

      // Simulate quota exceeded
      mockLocalStorage._quotaExceeded = true

      // This should not throw an error
      const response = await result.current.placeOrder({
        pair: 'REC/USDT',
        type: 'limit',
        side: 'buy',
        price: 45,
        amount: 100
      })

      // Order should still be created in memory
      expect(response.success).toBe(true)
      expect(response.orderId).toBeDefined()

      await waitFor(() => {
        expect(result.current.orders.length).toBe(1)
      })

      // But localStorage should have failed silently
      expect(result.current.orders[0].id).toBe(response.orderId)
    })

    it('should gracefully handle QuotaExceededError when saving portfolio', async () => {
      const { result } = renderHook(() => useTrading())

      // Place an order first
      await act(async () => {
        await result.current.placeOrder({
          pair: 'REC/USDT',
          type: 'market',
          side: 'buy',
          price: 0,
          amount: 100
        })
      })

      // Now simulate quota exceeded for subsequent saves
      mockLocalStorage._quotaExceeded = true

      // Simulate order fill (which updates portfolio)
      await waitFor(() => {
        if (result.current.orders.length > 0) {
          result.current.simulateOrderFill(result.current.orders[0].id)
        }
      })

      // Should not throw, portfolio should still update in memory
      await waitFor(() => {
        expect(result.current.portfolio.holdings['REC']).toBeDefined()
      })
    })
  })

  describe('useTrading - localStorage unavailable', () => {
    it('should initialize with defaults when localStorage is unavailable', () => {
      mockLocalStorage._unavailable = true

      const { result } = renderHook(() => useTrading())

      // Should have default values
      expect(result.current.orders).toEqual([])
      expect(result.current.portfolio.balance).toBe(10000)
      expect(result.current.portfolio.holdings).toEqual({})
    })

    it('should continue operations without localStorage', async () => {
      const { result } = renderHook(() => useTrading())

      mockLocalStorage._unavailable = true

      // Should still be able to place orders
      const response = await result.current.placeOrder({
        pair: 'REC/USDT',
        type: 'limit',
        side: 'buy',
        price: 45,
        amount: 100
      })

      expect(response.success).toBe(true)

      await waitFor(() => {
        expect(result.current.orders.length).toBe(1)
      })
    })

    it('should handle reset without localStorage', async () => {
      const { result } = renderHook(() => useTrading())

      // Place an order first
      await act(async () => {
        await result.current.placeOrder({
          pair: 'REC/USDT',
          type: 'limit',
          side: 'buy',
          price: 45,
          amount: 100
        })
      })

      await waitFor(() => {
        expect(result.current.orders.length).toBe(1)
      })

      // Now make localStorage unavailable and reset
      mockLocalStorage._unavailable = true

      act(() => {
        result.current.resetData()
      })

      // Should reset in-memory state without errors
      await waitFor(() => {
        expect(result.current.orders).toEqual([])
        expect(result.current.portfolio.balance).toBe(10000)
      })
    })
  })

  describe('useTrading - Corrupted data recovery', () => {
    it('should handle corrupted orders data gracefully', () => {
      // Pre-populate with corrupted data
      mockLocalStorage._corrupted = true
      localStorage.setItem('carbonx_orders', 'invalid-json-{')

      const { result } = renderHook(() => useTrading())

      // Should initialize with empty state instead of crashing
      expect(result.current.orders).toEqual([])
    })

    it('should handle corrupted portfolio data gracefully', () => {
      mockLocalStorage._corrupted = true
      localStorage.setItem('carbonx_portfolio', '{corrupted}')

      const { result } = renderHook(() => useTrading())

      // Should initialize with defaults
      expect(result.current.portfolio.balance).toBe(10000)
      expect(result.current.portfolio.holdings).toEqual({})
    })

    it('should handle corrupted order history gracefully', () => {
      mockLocalStorage._corrupted = true
      localStorage.setItem('carbonx_order_history', 'not-valid-json')

      const { result } = renderHook(() => useTrading())

      expect(result.current.orderHistory).toEqual([])
    })
  })

  describe('useHourlyMatching - QuotaExceededError', () => {
    it('should gracefully handle QuotaExceededError on save', async () => {
      const { result } = renderHook(() => useHourlyMatching())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Simulate quota exceeded on refresh
      mockLocalStorage._quotaExceeded = true

      act(() => {
        result.current.refresh()
      })

      // Should not throw, should still have data in memory
      await waitFor(() => {
        expect(result.current.data.length).toBeGreaterThan(0)
      })
    })
  })

  describe('useHourlyMatching - localStorage unavailable', () => {
    it('should initialize with generated data when localStorage unavailable', async () => {
      mockLocalStorage._unavailable = true

      const { result } = renderHook(() => useHourlyMatching())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have generated mock data
      expect(result.current.data).toBeDefined()
      expect(result.current.data.length).toBe(24)
    })

    it('should handle refresh without localStorage', async () => {
      const { result } = renderHook(() => useHourlyMatching())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      mockLocalStorage._unavailable = true

      act(() => {
        result.current.refresh()
      })

      // Should still work, just won't persist
      await waitFor(() => {
        expect(result.current.data.length).toBe(24)
      })
    })
  })

  describe('useHourlyMatching - Corrupted data recovery', () => {
    it('should handle corrupted stored data', async () => {
      mockLocalStorage._corrupted = true
      localStorage.setItem('carbonx_hourly_matching', '{invalid}')

      const { result } = renderHook(() => useHourlyMatching())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should fallback to generated data
      expect(result.current.data.length).toBe(24)
      expect(result.current.error).toBeNull()
    })
  })

  describe('useCFECompliance - QuotaExceededError', () => {
    it('should gracefully handle QuotaExceededError when saving compliance data', async () => {
      const { result } = renderHook(() => useCFECompliance())

      mockLocalStorage._quotaExceeded = true

      act(() => {
        result.current.recordHourlyTrade(100, 80)
      })

      await waitFor(() => {
        // Should still record in memory
        expect(result.current.hourlyData.length).toBe(1)
        expect(result.current.compliancePercent).toBe(80)
      })
    })
  })

  describe('useCFECompliance - localStorage unavailable', () => {
    it('should initialize with empty state when localStorage unavailable', () => {
      mockLocalStorage._unavailable = true

      const { result } = renderHook(() => useCFECompliance())

      expect(result.current.hourlyData).toEqual([])
      expect(result.current.compliancePercent).toBe(0)
    })

    it('should record trades without localStorage', async () => {
      const { result } = renderHook(() => useCFECompliance())

      mockLocalStorage._unavailable = true

      act(() => {
        result.current.recordHourlyTrade(100, 80)
      })

      await waitFor(() => {
        expect(result.current.hourlyData.length).toBe(1)
      })
    })

    it('should handle reset without localStorage', async () => {
      const { result } = renderHook(() => useCFECompliance())

      // Record some data
      act(() => {
        result.current.recordHourlyTrade(100, 80)
      })

      await waitFor(() => {
        expect(result.current.hourlyData.length).toBe(1)
      })

      // Make localStorage unavailable and reset
      mockLocalStorage._unavailable = true

      act(() => {
        result.current.reset()
      })

      // Should clear in-memory state
      await waitFor(() => {
        expect(result.current.hourlyData).toEqual([])
      })
    })
  })

  describe('useCFECompliance - Corrupted data recovery', () => {
    it('should handle corrupted stored compliance data', () => {
      mockLocalStorage._corrupted = true
      localStorage.setItem('carbonx_cfe_compliance', 'invalid-data')

      const { result } = renderHook(() => useCFECompliance())

      // Should start with empty state instead of crashing
      expect(result.current.hourlyData).toEqual([])
      expect(result.current.compliancePercent).toBe(0)
    })
  })

  describe('Cross-hook consistency', () => {
    it('should handle simultaneous localStorage failures across all hooks', async () => {
      mockLocalStorage._quotaExceeded = true

      const tradingResult = renderHook(() => useTrading()).result
      const matchingResult = renderHook(() => useHourlyMatching()).result
      const complianceResult = renderHook(() => useCFECompliance()).result

      // All hooks should initialize without errors
      expect(tradingResult.current.orders).toEqual([])
      expect(complianceResult.current.hourlyData).toEqual([])

      await waitFor(() => {
        expect(matchingResult.current.loading).toBe(false)
      })

      expect(matchingResult.current.data.length).toBe(24)
    })
  })
})
