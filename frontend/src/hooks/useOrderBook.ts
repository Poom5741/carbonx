import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

export interface OrderBookEntry {
  price: number
  size: number
  total: number
  depth: number
}

export interface OrderBookData {
  asks: OrderBookEntry[]
  bids: OrderBookEntry[]
  maxAskDepth: number
  maxBidDepth: number
  spread: number
  spreadPercent: number
}

/**
 * useOrderBook - Generates and maintains an order book for a given price
 *
 * Features:
 * - Generates asks (above current price) and bids (below current price)
 * - Calculates depth percentages for visualization
 * - Updates order book periodically to simulate real-time activity
 * - Calculates spread between best bid and ask
 *
 * @param price - The current market price
 * @param levels - Number of price levels to generate (default: 12)
 * @param updateInterval - How often to update in ms (default: 2000)
 */
export function useOrderBook(
  price: number = 0,
  levels: number = 12,
  updateInterval: number = 2000
): OrderBookData {
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const priceRef = useRef(price)

  // Update price ref
  useEffect(() => {
    priceRef.current = price
  }, [price])

  // Generate a single order book entry with random size
  const generateEntry = useCallback((entryPrice: number): OrderBookEntry => {
    const size = Math.random() * 500 + 50
    const roundedPrice = parseFloat(entryPrice.toFixed(2))
    const roundedSize = parseFloat(size.toFixed(2))
    const total = roundedPrice * roundedSize // Calculate total from rounded values
    return {
      price: roundedPrice,
      size: roundedSize,
      total: parseFloat(total.toFixed(2)),
      depth: 0 // Will be calculated after all entries are generated
    }
  }, [])

  // Generate complete order book
  const generateOrderBook = useCallback((currentPrice: number): { asks: OrderBookEntry[], bids: OrderBookEntry[] } => {
    // Handle edge cases
    if (currentPrice <= 0 || levels <= 0) {
      return { asks: [], bids: [] }
    }

    const newAsks: OrderBookEntry[] = []
    const newBids: OrderBookEntry[] = []
    const priceIncrement = currentPrice * 0.002 // 0.2% price increments

    // Generate asks (prices above current) - ordered highest to lowest for display
    for (let i = levels; i >= 1; i--) {
      newAsks.push(generateEntry(currentPrice + (i * priceIncrement)))
    }

    // Generate bids (prices below current) - ordered lowest to highest
    // Use reverse loop to get ascending order
    for (let i = levels; i >= 1; i--) {
      newBids.push(generateEntry(currentPrice - (i * priceIncrement)))
    }

    // Sort bids ascending (lowest to highest)
    newBids.sort((a, b) => a.price - b.price)

    // Calculate depths
    const maxAskSize = Math.max(...newAsks.map(a => a.size))
    const maxBidSize = Math.max(...newBids.map(b => b.size))

    newAsks.forEach(entry => {
      entry.depth = maxAskSize > 0 ? entry.size / maxAskSize : 0
    })

    newBids.forEach(entry => {
      entry.depth = maxBidSize > 0 ? entry.size / maxBidSize : 0
    })

    return {
      asks: newAsks,
      bids: newBids
    }
  }, [levels, generateEntry])

  // Calculate max depths for visualization
  const maxAskDepth = useMemo(() => {
    return asks.length > 0 ? Math.max(...asks.map(a => a.depth)) : 0
  }, [asks])

  const maxBidDepth = useMemo(() => {
    return bids.length > 0 ? Math.max(...bids.map(b => b.depth)) : 0
  }, [bids])

  // Calculate spread
  const spread = useMemo(() => {
    // Best ask is the lowest ask price (last in reversed array)
    // Best bid is the highest bid price (last in array)
    const bestAsk = asks.length > 0 ? asks[asks.length - 1].price : 0
    const bestBid = bids.length > 0 ? bids[bids.length - 1].price : 0
    return bestAsk - bestBid
  }, [asks, bids])

  const spreadPercent = useMemo(() => {
    const bestAsk = asks.length > 0 ? asks[asks.length - 1].price : 0
    return bestAsk > 0 ? spread / bestAsk : 0
  }, [asks, spread])

  // Update order book on mount and when price changes
  useEffect(() => {
    const { asks: newAsks, bids: newBids } = generateOrderBook(price)
    setAsks(newAsks)
    setBids(newBids)
  }, [price, levels, generateOrderBook])

  // Set up periodic updates
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const currentPrice = priceRef.current
      const { asks: newAsks, bids: newBids } = generateOrderBook(currentPrice)
      setAsks(newAsks)
      setBids(newBids)
    }, updateInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [updateInterval, generateOrderBook])

  return {
    asks,
    bids,
    maxAskDepth,
    maxBidDepth,
    spread,
    spreadPercent
  }
}
