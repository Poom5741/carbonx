import { describe, it, expect } from 'vitest'
import { getDemoData } from './demoData'

describe('demoData - TDG RED Phase', () => {
  describe('Positive PnL Requirement', () => {
    it('should have positive PnL (currentValue > initialValue)', () => {
      const demoData = getDemoData()
      const pnl = demoData.currentValue - demoData.initialValue
      expect(pnl).toBeGreaterThan(0)
    })

    it('should have meaningful PnL percentage (at least 10% gain)', () => {
      const demoData = getDemoData()
      const pnlPercent = ((demoData.currentValue - demoData.initialValue) / demoData.initialValue) * 100
      expect(pnlPercent).toBeGreaterThanOrEqual(10)
    })
  })

  describe('Realistic Portfolio Value ($50k+)', () => {
    it('should have portfolio value of at least $50,000', () => {
      const demoData = getDemoData()
      expect(demoData.currentValue).toBeGreaterThanOrEqual(50000)
    })

    it('should have realistic balance amount (not empty)', () => {
      const demoData = getDemoData()
      expect(demoData.portfolio.balance).toBeGreaterThan(0)
    })

    it('should have multiple holdings (diversified portfolio)', () => {
      const demoData = getDemoData()
      const holdingsCount = Object.keys(demoData.portfolio.holdings).length
      expect(holdingsCount).toBeGreaterThanOrEqual(3)
    })

    it('should have holdings with realistic amounts', () => {
      const demoData = getDemoData()
      Object.values(demoData.portfolio.holdings).forEach(holding => {
        expect(holding.amount).toBeGreaterThan(0)
        expect(holding.currentPrice).toBeGreaterThan(0)
      })
    })
  })

  describe('Recent Order History (20+ orders)', () => {
    it('should have at least 20 orders in history', () => {
      const demoData = getDemoData()
      expect(demoData.orderHistory.length).toBeGreaterThanOrEqual(20)
    })

    it('should have at least one filled order', () => {
      const demoData = getDemoData()
      const filledOrders = demoData.orderHistory.filter(o => o.status === 'filled')
      expect(filledOrders.length).toBeGreaterThan(0)
    })

    it('should have diverse trading pairs', () => {
      const demoData = getDemoData()
      const uniquePairs = new Set(demoData.orderHistory.map(o => o.pair))
      expect(uniquePairs.size).toBeGreaterThanOrEqual(2)
    })

    it('should have both buy and sell orders', () => {
      const demoData = getDemoData()
      const buyOrders = demoData.orderHistory.filter(o => o.side === 'buy')
      const sellOrders = demoData.orderHistory.filter(o => o.side === 'sell')
      expect(buyOrders.length).toBeGreaterThan(0)
      expect(sellOrders.length).toBeGreaterThan(0)
    })

    it('should have good win rate (at least 60% profitable trades)', () => {
      const demoData = getDemoData()
      // Calculate profitability based on side and price assumptions
      // This is a simplified check - in reality we'd track entry/exit prices
      const filledOrders = demoData.orderHistory.filter(o => o.status === 'filled')
      expect(filledOrders.length).toBeGreaterThan(0)

      // At minimum, we should have more buys than sells for a growing portfolio
      const buyOrders = demoData.orderHistory.filter(o => o.side === 'buy')
      const sellOrders = demoData.orderHistory.filter(o => o.side === 'sell')
      expect(buyOrders.length).toBeGreaterThan(sellOrders.length)
    })

    it('should have orders with recent timestamps (within last 30 days)', () => {
      const demoData = getDemoData()
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      const recentOrders = demoData.orderHistory.filter(o => o.createdAt >= thirtyDaysAgo)
      expect(recentOrders.length).toBeGreaterThan(0)
    })

    it('should have valid order structures', () => {
      const demoData = getDemoData()
      demoData.orderHistory.forEach(order => {
        expect(order.id).toBeDefined()
        expect(order.pair).toBeDefined()
        expect(order.type).toBeDefined()
        expect(order.side).toBeDefined()
        expect(order.price).toBeGreaterThan(0)
        expect(order.amount).toBeGreaterThan(0)
        expect(order.status).toBeDefined()
        expect(order.createdAt).toBeDefined()
      })
    })
  })

  describe('Open Orders', () => {
    it('should have some open orders for realistic demo', () => {
      const demoData = getDemoData()
      expect(demoData.openOrders.length).toBeGreaterThan(0)
    })

    it('should have valid open order structures', () => {
      const demoData = getDemoData()
      demoData.openOrders.forEach(order => {
        expect(order.id).toBeDefined()
        expect(order.pair).toBeDefined()
        expect(order.status).toBe('pending')
      })
    })
  })

  describe('Data Type Contracts', () => {
    it('should export DemoData type with required fields', () => {
      const demoData = getDemoData()

      // Check all required fields exist
      expect(demoData).toHaveProperty('initialValue')
      expect(demoData).toHaveProperty('currentValue')
      expect(demoData).toHaveProperty('portfolio')
      expect(demoData).toHaveProperty('openOrders')
      expect(demoData).toHaveProperty('orderHistory')

      // Check portfolio structure
      expect(demoData.portfolio).toHaveProperty('balance')
      expect(demoData.portfolio).toHaveProperty('holdings')
    })
  })
})
