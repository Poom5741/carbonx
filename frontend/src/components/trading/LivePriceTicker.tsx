import React, { useMemo } from 'react'
import { ConnectionStatus } from './ConnectionStatus'
import { ErrorState } from '../common/ErrorBoundary'
import { LoadingState } from '../common/LoadingState'

export interface Trade {
  price: number
  amount: number
  time: number
  side: 'buy' | 'sell'
}

export interface LivePriceTickerProps {
  trades: Trade[]
  maxTrades?: number
  isConnected?: boolean
  loading?: boolean
  error?: Error | null
  onReconnect?: () => void
  onRetry?: () => void
  className?: string
}

/**
 * LivePriceTicker - Ticker showing recent trades with timestamp
 *
 * Features:
 * - Shows recent trades in reverse chronological order (newest first)
 * - Color-coded: green for buys, red for sells
 * - Timestamp in HH:MM:SS format
 * - Connection status indicator
 * - Auto-scrolling to show most recent trades
 * - Configurable max trades to display
 */
export const LivePriceTicker: React.FC<LivePriceTickerProps> = ({
  trades,
  maxTrades = 10,
  isConnected = true,
  loading = false,
  error,
  onReconnect,
  onRetry,
  className = ''
}) => {
  // Format timestamp to HH:MM:SS
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Format large numbers (e.g., 1500 -> 1.5K)
  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toFixed(0)
  }

  // Sort trades by time (newest first) and limit to maxTrades
  const displayTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => b.time - a.time)
      .slice(0, maxTrades)
  }, [trades, maxTrades])

  // Loading state
  if (loading) {
    return (
      <div className={`bg-[#111827] rounded-lg p-4 ${className}`} data-testid="live-price-ticker">
        <LoadingState type="ticker" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-[#111827] rounded-lg p-4 ${className}`} data-testid="live-price-ticker">
        <div data-testid="ticker-error-state">
          <ErrorState
            type="data-load"
            title="Connection Temporarily Unavailable"
            message="We're having trouble connecting to the trading feed. This happens occasionally during network updates."
            onRetry={onRetry || onReconnect}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-[#111827] rounded-lg p-4 ${className}`} data-testid="live-price-ticker">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Recent Trades</h3>
        <div data-testid="ticker-connection">
          <ConnectionStatus
            forceDisconnected={!isConnected}
            onReconnectAttempt={onReconnect}
          />
        </div>
      </div>

      {/* Trades List */}
      {displayTrades.length === 0 ? (
        <div className="text-center py-8 text-[#6b7280] text-sm" data-testid="empty-state">
          No recent trades
        </div>
      ) : (
        <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
          {displayTrades.map((trade, index) => (
            <div
              key={`${trade.time}-${index}`}
              data-testid={`trade-${index}`}
              className={`grid grid-cols-3 gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors ${
                trade.side === 'buy' ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'
              }`}
            >
              {/* Price */}
              <span className="font-mono">
                {trade.price.toFixed(2)}
              </span>

              {/* Amount */}
              <span className="font-mono text-right">
                {formatAmount(trade.amount)}
              </span>

              {/* Time */}
              <span className="text-[#6b7280] text-right text-xs">
                {formatTime(trade.time)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LivePriceTicker
