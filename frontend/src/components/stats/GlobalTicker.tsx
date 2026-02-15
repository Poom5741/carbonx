import React from 'react'

export interface TraderStats {
  address: string
  pnl: number
}

export interface GlobalStats {
  volume24h: number
  activeTraders: number
  topTraders: TraderStats[]
}

interface GlobalTickerProps {
  stats: GlobalStats
  className?: string
}

// Format volume to readable format (K, M, B)
const formatVolume = (volume: number): string => {
  if (volume >= 1_000_000_000) {
    return `$${(volume / 1_000_000_000).toFixed(2)}B`
  }
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(2)}K`
  }
  return `$${volume.toFixed(2)}`
}

// Truncate address for display
const truncateAddress = (address: string): string => {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const GlobalTicker: React.FC<GlobalTickerProps> = ({ stats, className = '' }) => {
  const { volume24h, activeTraders, topTraders } = stats

  return (
    <div
      data-testid="global-ticker"
      className={`bg-[#0a0e17] border-b border-gray-800 ${className}`}
    >
      {/* Scrolling ticker container */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-8 overflow-x-auto">
          {/* Global Market Stats */}
          <div className="flex items-center gap-6 shrink-0">
            {/* 24h Volume */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-400 text-sm">24h Volume</span>
              <span className="text-white font-semibold">{formatVolume(volume24h)}</span>
            </div>

            {/* Active Traders */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#40ffa9]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              <span className="text-gray-400 text-sm">Active Traders</span>
              <span className="text-white font-semibold">{activeTraders.toLocaleString()}</span>
            </div>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-700 shrink-0" />

          {/* Top Traders Leaderboard */}
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm shrink-0">Top Traders (24h)</span>
            <div className="flex items-center gap-4">
              {topTraders.length > 0 ? (
                topTraders.map((trader, index) => (
                  <div
                    key={trader.address}
                    className="flex items-center gap-2 shrink-0"
                    data-testid={`trader-${index}`}
                  >
                    {/* Rank badge */}
                    {index < 3 && (
                      <span
                        className={`text-xs font-bold ${
                          index === 0
                            ? 'text-yellow-400'
                            : index === 1
                            ? 'text-gray-300'
                            : 'text-amber-600'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    )}
                    {/* Address */}
                    <span className="text-gray-300 text-sm">{truncateAddress(trader.address)}</span>
                    {/* PnL */}
                    <span
                      className={`text-sm font-medium ${
                        trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                      data-testid={`pnl-${index}`}
                    >
                      {trader.pnl >= 0 ? '+' : ''}{trader.pnl.toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No data available</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for simulating live stats updates
export function useGlobalStats() {
  const [stats, setStats] = React.useState<GlobalStats>({
    volume24h: 1250000,
    activeTraders: 342,
    topTraders: [
      { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', pnl: 45.2 },
      { address: '0x1234567890123456789012345678901234567890', pnl: 32.8 },
      { address: '0x9876543210987654321098765432109876543210', pnl: 28.5 },
      { address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12', pnl: 21.3 },
      { address: '0xFEDCBA0987654321FEDCBA0987654321FEDCBA09', pnl: 18.9 }
    ]
  })

  // Simulate live updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        // Randomly update volume
        const volumeChange = (Math.random() - 0.5) * 50000
        const newVolume = Math.max(0, prev.volume24h + volumeChange)

        // Randomly update active traders
        const traderChange = Math.floor((Math.random() - 0.5) * 10)
        const newTraders = Math.max(100, prev.activeTraders + traderChange)

        // Slightly adjust PnL for top traders
        const newTopTraders = prev.topTraders.map(trader => ({
          ...trader,
          pnl: Math.max(-100, Math.min(100, trader.pnl + (Math.random() - 0.5) * 2))
        }))

        return {
          volume24h: newVolume,
          activeTraders: newTraders,
          topTraders: newTopTraders
        }
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return stats
}
