import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useResetDemo } from './useResetDemo'

describe('useResetDemo - TDG RED Phase', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  afterEach(() => {
    // Clean up after each test
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  describe('Initial State', () => {
    it('should initialize with isResetting false', () => {
      const { result } = renderHook(() => useResetDemo())
      expect(result.current.isResetting).toBe(false)
    })

    it('should provide resetDemo function', () => {
      const { result } = renderHook(() => useResetDemo())
      expect(typeof result.current.resetDemo).toBe('function')
    })
  })

  describe('resetDemo Function', () => {
    it('should replace old data with fresh demo data', async () => {
      // Set some initial data
      localStorage.setItem('carbonx_orders', JSON.stringify([{ id: 'test' }]))
      localStorage.setItem('carbonx_portfolio', JSON.stringify({ balance: 5000 }))
      localStorage.setItem('carbonx_order_history', JSON.stringify([]))

      expect(localStorage.getItem('carbonx_orders')).toBe('[{"id":"test"}]')
      expect(localStorage.getItem('carbonx_portfolio')).toBe('{"balance":5000}')

      const { result } = renderHook(() => useResetDemo())
      await result.current.resetDemo()

      // localStorage should have fresh demo data (not null, not the old data)
      const newOrders = localStorage.getItem('carbonx_orders')
      const newPortfolio = localStorage.getItem('carbonx_portfolio')
      const newHistory = localStorage.getItem('carbonx_order_history')

      expect(newOrders).toBeDefined()
      expect(newPortfolio).toBeDefined()
      expect(newHistory).toBeDefined()

      // Should NOT be the old test data
      expect(newOrders).not.toBe('[{"id":"test"}]')
      expect(newPortfolio).not.toBe('{"balance":5000}')

      // Should have demo data structure
      expect(JSON.parse(newOrders!)).toBeInstanceOf(Array)
      expect(JSON.parse(newPortfolio!)).toHaveProperty('holdings')
    })

    it('should load fresh demo data after reset', async () => {
      const { result } = renderHook(() => useResetDemo())
      await result.current.resetDemo()

      // Check that demo data was loaded
      const orders = localStorage.getItem('carbonx_orders')
      const portfolio = localStorage.getItem('carbonx_portfolio')
      const history = localStorage.getItem('carbonx_order_history')

      expect(orders).toBeDefined()
      expect(portfolio).toBeDefined()
      expect(history).toBeDefined()

      // Verify the data is valid JSON and has expected structure
      const parsedOrders = JSON.parse(orders!)
      const parsedPortfolio = JSON.parse(portfolio!)
      const parsedHistory = JSON.parse(history!)

      expect(Array.isArray(parsedOrders)).toBe(true)
      expect(parsedPortfolio).toHaveProperty('balance')
      expect(parsedPortfolio).toHaveProperty('holdings')
      expect(Array.isArray(parsedHistory)).toBe(true)
    })

    it('should load demo data with positive PnL', async () => {
      const { result } = renderHook(() => useResetDemo())
      await result.current.resetDemo()

      const portfolio = JSON.parse(localStorage.getItem('carbonx_portfolio')!)
      JSON.parse(localStorage.getItem('carbonx_order_history')!)

      // Calculate total value
      const holdingsValue = Object.values(portfolio.holdings).reduce(
        (sum: number, h: any) => sum + (h.amount * h.currentPrice),
        0
      )
      const currentValue = portfolio.balance + holdingsValue
      const initialValue = 10000

      expect(currentValue).toBeGreaterThan(initialValue)
    })

    it('should set isResetting to false after completion', async () => {
      const { result } = renderHook(() => useResetDemo())

      expect(result.current.isResetting).toBe(false)

      await result.current.resetDemo()

      // isResetting should be false after completion and cooldown - use waitFor for state updates
      // Need to account for the 2-second cooldown
      await waitFor(() => {
        expect(result.current.isResetting).toBe(false)
      }, { timeout: 5000 })
    })

    it('should load demo data with 20+ order history', async () => {
      const { result } = renderHook(() => useResetDemo())
      await result.current.resetDemo()

      const history = JSON.parse(localStorage.getItem('carbonx_order_history')!)
      expect(history.length).toBeGreaterThanOrEqual(20)
    })

    it('should load demo data with diversified holdings', async () => {
      const { result } = renderHook(() => useResetDemo())
      await result.current.resetDemo()

      const portfolio = JSON.parse(localStorage.getItem('carbonx_portfolio')!)
      const holdingsCount = Object.keys(portfolio.holdings).length

      // Due to random nature of order generation, we may get 2-4 holdings
      expect(holdingsCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage being unavailable gracefully', async () => {
      // Mock localStorage to throw errors
      const originalLocalStorage = global.localStorage
      // @ts-ignore - intentionally breaking localStorage
      delete global.localStorage

      const { result } = renderHook(() => useResetDemo())

      // Should not throw error
      await expect(result.current.resetDemo()).resolves.not.toThrow()

      // Restore localStorage
      global.localStorage = originalLocalStorage
    })
  })
})
