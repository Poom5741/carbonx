import { useState, useCallback, useEffect, useRef } from 'react'

export type OrderType = 'market' | 'limit' | 'stop'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'partial'

export interface Order {
  id: string
  pair: string
  type: OrderType
  side: OrderSide
  price: number
  amount: number
  status: OrderStatus
  filled: number
  createdAt: number
  filledAt?: number
}

export interface Holding {
  amount: number
  currentPrice: number
}

export interface Portfolio {
  balance: number
  holdings: Record<string, Holding>
}

export interface PlaceOrderParams {
  pair: string
  type: OrderType
  side: OrderSide
  price: number
  amount: number
}

interface PlaceOrderResponse {
  success: boolean
  orderId?: string
  error?: string
}

const INITIAL_BALANCE = 10000
const STORAGE_KEYS = {
  ORDERS: 'carbonx_orders',
  PORTFOLIO: 'carbonx_portfolio',
  ORDER_HISTORY: 'carbonx_order_history'
}

export function useTrading() {
  const [orders, setOrders] = useState<Order[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio>({
    balance: INITIAL_BALANCE,
    holdings: {}
  })
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderHistory, setOrderHistory] = useState<Order[]>([])

  // Use ref for simulateOrderFill to avoid dependency issues
  const simulateOrderFillRef = useRef<(orderId: string) => void>(() => {})

  // Load from localStorage on mount
  useEffect(() => {
    // Skip in SSR/test environments
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    try {
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS)
      const storedPortfolio = localStorage.getItem(STORAGE_KEYS.PORTFOLIO)
      const storedHistory = localStorage.getItem(STORAGE_KEYS.ORDER_HISTORY)

      if (storedOrders) {
        setOrders(JSON.parse(storedOrders))
      }
      if (storedPortfolio) {
        setPortfolio(JSON.parse(storedPortfolio))
      }
      if (storedHistory) {
        setOrderHistory(JSON.parse(storedHistory))
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
    }
  }, [])

  // Save orders to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }
    if (orders.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
    } else {
      localStorage.removeItem(STORAGE_KEYS.ORDERS)
    }
  }, [orders])

  // Save portfolio to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio))
  }, [portfolio])

  // Save order history
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }
    if (orderHistory.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, JSON.stringify(orderHistory))
    } else {
      localStorage.removeItem(STORAGE_KEYS.ORDER_HISTORY)
    }
  }, [orderHistory])

  const generateOrderId = useCallback(() => {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const simulateOrderFill = useCallback((orderId: string) => {
    setOrders(prev => {
      const orderIndex = prev.findIndex(o => o.id === orderId)
      if (orderIndex === -1) return prev

      const order = prev[orderIndex]
      const filledOrder: Order = {
        ...order,
        status: 'filled',
        filled: order.amount,
        filledAt: Date.now()
      }

      // Update portfolio
      setPortfolio(current => {
        const newHoldings = { ...current.holdings }
        const baseAsset = order.pair.split('/')[0]

        if (order.side === 'buy') {
          // Deduct from balance, add to holdings
          if (newHoldings[baseAsset]) {
            newHoldings[baseAsset] = {
              ...newHoldings[baseAsset],
              amount: newHoldings[baseAsset].amount + order.amount
            }
          } else {
            newHoldings[baseAsset] = {
              amount: order.amount,
              currentPrice: order.price
            }
          }
        } else {
          // Add to balance, deduct from holdings
          if (newHoldings[baseAsset]) {
            newHoldings[baseAsset] = {
              ...newHoldings[baseAsset],
              amount: newHoldings[baseAsset].amount - order.amount
            }
          }
        }

        return {
          balance: order.side === 'buy'
            ? current.balance - (order.price * order.amount)
            : current.balance + (order.price * order.amount),
          holdings: newHoldings
        }
      })

      // Add to history
      setOrderHistory(h => [...h, filledOrder])

      // Remove from active orders
      return prev.filter(o => o.id !== orderId)
    })
  }, [])

  // Update ref
  simulateOrderFillRef.current = simulateOrderFill

  const validateOrder = useCallback((params: PlaceOrderParams): string | null => {
    const { type, side, price, amount, pair } = params

    // Validate amount
    if (!amount || amount <= 0) {
      return 'Amount is required'
    }

    // Validate price for limit orders
    if (type === 'limit' && (!price || price <= 0)) {
      return 'Price is required for limit orders'
    }

    // Validate sufficient balance for buy orders
    const estimatedCost = type === 'market' ? amount * 50 : price * amount // Use 50 as default market price
    if (side === 'buy' && estimatedCost > portfolio.balance) {
      return 'Insufficient balance'
    }

    // Validate sufficient holdings for sell orders
    const baseAsset = pair.split('/')[0]
    if (side === 'sell') {
      const holding = portfolio.holdings[baseAsset]
      if (!holding || holding.amount < amount) {
        return 'Insufficient holdings'
      }
    }

    return null
  }, [portfolio])

  const placeOrder = useCallback(async (params: PlaceOrderParams): Promise<PlaceOrderResponse> => {
    // Validate first
    const error = validateOrder(params)
    if (error) {
      return { success: false, error }
    }

    setIsPlacingOrder(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const { pair, type, side, price, amount } = params
    const orderId = generateOrderId()

    const newOrder: Order = {
      id: orderId,
      pair,
      type,
      side,
      price,
      amount,
      status: 'pending',
      filled: 0,
      createdAt: Date.now()
    }

    setOrders(prev => [...prev, newOrder])
    setIsPlacingOrder(false)

    // For market orders, simulate immediate fill
    if (type === 'market') {
      setTimeout(() => {
        simulateOrderFillRef.current(orderId)
      }, 10)
    }

    return { success: true, orderId }
  }, [generateOrderId, validateOrder])

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId)
      if (!order) return prev

      // Add to history
      const cancelledOrder: Order = { ...order, status: 'cancelled' }
      setOrderHistory(h => [...h, cancelledOrder])

      // Remove from active orders
      return prev.filter(o => o.id !== orderId)
    })
  }, [])

  const getTotalValue = useCallback(() => {
    let total = portfolio.balance
    Object.entries(portfolio.holdings).forEach(([symbol, holding]) => {
      total += holding.amount * holding.currentPrice
    })
    return total
  }, [portfolio])

  const resetData = useCallback(() => {
    setOrders([])
    setOrderHistory([])
    setPortfolio({ balance: INITIAL_BALANCE, holdings: {} })
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ORDERS)
      localStorage.removeItem(STORAGE_KEYS.PORTFOLIO)
      localStorage.removeItem(STORAGE_KEYS.ORDER_HISTORY)
    }
  }, [])

  return {
    orders,
    portfolio,
    orderHistory,
    isPlacingOrder,
    placeOrder,
    cancelOrder,
    simulateOrderFill,
    getTotalValue,
    resetData
  }
}
