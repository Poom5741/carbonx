import type { Order, Portfolio } from '@/hooks/useTrading'

export interface DemoData {
  initialValue: number
  currentValue: number
  portfolio: Portfolio
  openOrders: Order[]
  orderHistory: Order[]
}

// Helper to generate timestamps spread over the last 30 days
const generateTimestamps = (count: number): number[] => {
  const now = Date.now()
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
  const step = (now - thirtyDaysAgo) / count

  return Array.from({ length: count }, (_, i) =>
    Math.floor(thirtyDaysAgo + (step * i) + (Math.random() * step * 0.5))
  ).sort((a, b) => a - b)
}

// Generate order IDs
const generateOrderId = (index: number): string =>
  `order-demo-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`

// Demo trading pairs
const PAIRS = ['REC/USDT', 'SOL/USDT', 'WIND/USDT', 'BCT/USDT']

// Generate realistic order history with profitable trades
const generateOrderHistory = (): Order[] => {
  const timestamps = generateTimestamps(25)
  const orders: Order[] = []

  // Strategy: Buy low, sell high for profit
  const priceRanges: Record<string, { min: number; max: number }> = {
    'REC/USDT': { min: 38, max: 52 },
    'SOL/USDT': { min: 85, max: 145 },
    'WIND/USDT': { min: 22, max: 38 },
    'BCT/USDT': { min: 18, max: 32 }
  }

  let pairIndex = 0
  let isBuy = true

  for (let i = 0; i < 25; i++) {
    const pair = PAIRS[pairIndex % PAIRS.length]
    const prices = priceRanges[pair]

    // Buy at lower prices, sell at higher prices
    const price = isBuy
      ? prices.min + Math.random() * (prices.max - prices.min) * 0.4
      : prices.min + Math.random() * (prices.max - prices.min) * 0.6 + (prices.max - prices.min) * 0.4

    const amount = 50 + Math.floor(Math.random() * 200)

    orders.push({
      id: generateOrderId(i),
      pair,
      type: 'limit',
      side: isBuy ? 'buy' : 'sell',
      price: Number(price.toFixed(2)),
      amount,
      status: i > 22 ? 'pending' : 'filled', // Last few are pending
      filled: i > 22 ? 0 : amount,
      createdAt: timestamps[i],
      filledAt: i > 22 ? undefined : timestamps[i] + 60000
    })

    // Flip side every 2-3 orders for realistic trading pattern
    if (Math.random() > 0.6) {
      isBuy = !isBuy
    }
    pairIndex++
  }

  return orders
}

// Calculate current portfolio value based on filled orders
const calculatePortfolio = (orderHistory: Order[]): Portfolio => {
  const INITIAL_BALANCE = 10000
  let balance = INITIAL_BALANCE
  const holdings: Record<string, { amount: number; currentPrice: number }> = {}

  // Current market prices (higher than buy prices for profit)
  const currentPrices: Record<string, number> = {
    'REC': 48.50,
    'SOL': 138.00,
    'WIND': 35.00,
    'BCT': 29.50
  }

  // Process filled orders
  orderHistory
    .filter(o => o.status === 'filled')
    .forEach(order => {
      const baseAsset = order.pair.split('/')[0]

      if (order.side === 'buy') {
        // Deduct from balance, add to holdings
        balance -= order.price * order.amount

        if (!holdings[baseAsset]) {
          holdings[baseAsset] = { amount: 0, currentPrice: currentPrices[baseAsset] }
        }
        holdings[baseAsset].amount += order.amount
      } else {
        // Add to balance, deduct from holdings
        balance += order.price * order.amount
        if (holdings[baseAsset]) {
          holdings[baseAsset].amount -= order.amount
          if (holdings[baseAsset].amount <= 0) {
            delete holdings[baseAsset]
          }
        }
      }
    })

  // Update current prices for all holdings
  Object.keys(holdings).forEach(asset => {
    holdings[asset].currentPrice = currentPrices[asset] || 45
  })

  return { balance, holdings }
}

// Get demo data
export const getDemoData = (): DemoData => {
  const orderHistory = generateOrderHistory()

  // Separate open orders from filled orders
  const openOrders = orderHistory.filter(o => o.status === 'pending')
  const filledOrders = orderHistory.filter(o => o.status !== 'pending')

  const portfolio = calculatePortfolio(filledOrders)

  // Calculate current value
  const holdingsValue = Object.values(portfolio.holdings).reduce(
    (sum, h) => sum + (h.amount * h.currentPrice),
    0
  )
  const currentValue = portfolio.balance + holdingsValue
  const initialValue = 10000

  return {
    initialValue,
    currentValue,
    portfolio,
    openOrders,
    orderHistory: filledOrders as Order[]
  }
}

// Helper to load demo data into localStorage
export const loadDemoData = (): void => {
  const demoData = getDemoData()

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('carbonx_orders', JSON.stringify(demoData.openOrders))
      localStorage.setItem('carbonx_portfolio', JSON.stringify(demoData.portfolio))
      localStorage.setItem('carbonx_order_history', JSON.stringify(demoData.orderHistory))
    } catch (error) {
      // Handle QuotaExceededError specifically
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.code === 22 ||
        error.code === 1014
      )) {
        console.error('localStorage quota exceeded. Please clear some data.')
        // Attempt to clear all data and retry once
        try {
          localStorage.clear()
          localStorage.setItem('carbonx_orders', JSON.stringify(demoData.openOrders))
          localStorage.setItem('carbonx_portfolio', JSON.stringify(demoData.portfolio))
          localStorage.setItem('carbonx_order_history', JSON.stringify(demoData.orderHistory))
        } catch (retryError) {
          console.error('Failed to load demo data after clearing storage:', retryError)
        }
      } else {
        console.error('Failed to load demo data:', error)
      }
    }
  }
}
