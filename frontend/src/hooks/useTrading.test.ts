import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTrading } from './useTrading'

describe('useTrading - Order Placement System (TDG)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should initialize with empty orders array', () => {
      const { result } = renderHook(() => useTrading())
      expect(result.current.orders).toEqual([])
    })

    it('should initialize with default portfolio balance', () => {
      const { result } = renderHook(() => useTrading())
      expect(result.current.portfolio.balance).toBe(10000)
      expect(result.current.portfolio.holdings).toEqual({})
    })

    it('should initialize with not placing state', () => {
      const { result } = renderHook(() => useTrading())
      expect(result.current.isPlacingOrder).toBe(false)
    })
  })

  describe('Order Placement Validation', () => {
    it('should validate that amount is required', async () => {
      const { result } = renderHook(() => useTrading())
      const response = await result.current.placeOrder({
        pair: 'REC/USDT',
        type: 'limit',
        side: 'buy',
        price: 45,
        amount: 0
      })
      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
    })

    it('should validate that price is required for limit orders', async () => {
      const { result } = renderHook(() => useTrading())
      const response = await result.current.placeOrder({
        pair: 'REC/USDT',
        type: 'limit',
        side: 'buy',
        price: 0,
        amount: 100
      })
      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
    })

    it('should validate sufficient balance for buy orders', async () => {
      const { result } = renderHook(() => useTrading())
      const response = await result.current.placeOrder({
        pair: 'REC/USDT',
        type: 'limit',
        side: 'buy',
        price: 100,
        amount: 200
      })
      expect(response.success).toBe(false)
      expect(response.error).toBe('Insufficient balance')
    })
  })

  describe('Order Placement Success', () => {
    it('should create a buy order with correct structure', async () => {
      const { result } = renderHook(() => useTrading())
      const response = await result.current.placeOrder({
        pair: 'REC/USDT',
        type: 'limit',
        side: 'buy',
        price: 45,
        amount: 100
      })
      expect(response.success).toBe(true)
      expect(response.orderId).toBeDefined()

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.orders.length).toBe(1)
      })

      expect(result.current.orders[0]).toMatchObject({
        id: expect.any(String),
        pair: 'REC/USDT',
        type: 'limit',
        side: 'buy',
        price: 45,
        amount: 100,
        status: 'pending',
        filled: 0
      })
    })
  })

  describe('Order Cancellation', () => {
    it('should cancel an existing order', async () => {
      const { result } = renderHook(() => useTrading())
      const response = await result.current.placeOrder({
        pair: 'REC/USDT',
        type: 'limit',
        side: 'buy',
        price: 45,
        amount: 100
      })

      // Wait for order to be added
      await waitFor(() => {
        expect(result.current.orders.length).toBe(1)
      })

      result.current.cancelOrder(response.orderId!)

      // Wait for order to be removed
      await waitFor(() => {
        expect(result.current.orders.length).toBe(0)
      })
    })

    it('should handle cancelling non-existent order gracefully', async () => {
      const { result } = renderHook(() => useTrading())
      result.current.cancelOrder('non-existent-id')
      expect(result.current.orders.length).toBe(0)
    })
  })

  describe('Local Storage Persistence', () => {
    it('should load orders from localStorage on mount', () => {
      const existingOrder = {
        id: 'test-order-1',
        pair: 'REC/USDT',
        type: 'limit' as const,
        side: 'buy' as const,
        price: 45,
        amount: 100,
        status: 'pending' as const,
        filled: 0,
        createdAt: Date.now()
      }
      localStorage.setItem('carbonx_orders', JSON.stringify([existingOrder]))
      const { result } = renderHook(() => useTrading())
      expect(result.current.orders).toHaveLength(1)
      expect(result.current.orders[0].id).toBe('test-order-1')
    })
  })

  describe('Market Order Support', () => {
    it('should accept market orders without price', async () => {
      const { result } = renderHook(() => useTrading())
      const response = await result.current.placeOrder({
        pair: 'REC/USDT',
        type: 'market',
        side: 'buy',
        price: 0,
        amount: 100
      })
      expect(response.success).toBe(true)
    })
  })
})
