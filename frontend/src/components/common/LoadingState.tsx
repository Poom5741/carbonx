/**
 * LoadingState Component - TDG GREEN Phase
 *
 * Professional loading skeletons with:
 * - Shimmer animation (not spinner)
 * - Brand color #40ffa9 for accents
 * - Layout-matching skeletons
 * - Accessibility support
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingStateProps {
  type: 'chart' | 'stats' | 'table' | 'ticker'
  rowCount?: number
  className?: string
}

/**
 * Shimmer animation keyframes - added via Tailwind
 * shimmer: {
 *   '0%': { backgroundPosition: '-1000px 0' },
 *   '100%': { backgroundPosition: '1000px 0' }
 * }
 */

const shimmerStyle = {
  background: 'linear-gradient(90deg, #1a2234 25%, #1a2234 50%, #1a2234 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s infinite'
}

const shimmerAccentStyle = {
  background: 'linear-gradient(90deg, #1a2234 0%, rgba(64, 255, 169, 0.1) 50%, #1a2234 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s infinite'
}

/**
 * ChartSkeleton - Skeleton for HourlyMatchingChart
 */
const ChartSkeleton: React.FC = () => {
  return (
    <div
      data-testid="chart-skeleton-area"
      className="h-72 relative"
    >
      {/* Y-axis labels skeleton */}
      <div className="absolute left-0 top-0 bottom-10 w-16 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-4 w-12 bg-[#1a2234] rounded animate-pulse"
            style={shimmerStyle}
          />
        ))}
      </div>

      {/* Chart bars skeleton */}
      <div className="absolute left-16 right-0 top-0 bottom-10 flex items-end gap-0.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            data-testid={`skeleton-bar-${i}`}
            className="flex-1 rounded-t-sm"
            style={{
              ...shimmerAccentStyle,
              height: `${Math.random() * 60 + 20}%`
            }}
          />
        ))}
      </div>

      {/* X-axis labels skeleton */}
      <div className="absolute left-16 right-0 bottom-0 flex justify-between">
        {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((time) => (
          <div
            key={time}
            className="h-3 w-10 bg-[#1a2234] rounded animate-pulse"
            style={shimmerStyle}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * StatsSkeleton - Skeleton for stat cards
 */
const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          data-testid={`skeleton-stat-${i}`}
          className="bg-[#111827] rounded-xl p-6"
        >
          <div
            className="h-4 w-24 bg-[#1a2234] rounded mb-4"
            style={shimmerStyle}
          />
          <div
            className="h-8 w-32 bg-[#1a2234] rounded"
            style={shimmerAccentStyle}
          />
        </div>
      ))}
    </div>
  )
}

/**
 * TableSkeleton - Skeleton for data tables
 */
const TableSkeleton: React.FC<{ rowCount: number }> = ({ rowCount }) => {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-6 gap-2 px-4 py-3 border-b border-white/10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-[#1a2234] rounded"
            style={shimmerStyle}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <div
          key={i}
          data-testid={`skeleton-row-${i}`}
          className="grid grid-cols-6 gap-2 px-4 py-3 border-b border-white/5"
        >
          {Array.from({ length: 6 }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-[#1a2234] rounded"
              style={shimmerAccentStyle}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * TickerSkeleton - Skeleton for LivePriceTicker
 */
const TickerSkeleton: React.FC = () => {
  return (
    <div
      data-testid="ticker-skeleton"
      className="bg-[#111827] rounded-lg p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="h-5 w-28 bg-[#1a2234] rounded"
          style={shimmerStyle}
        />
        <div
          className="h-6 w-20 bg-[#1a2234] rounded-full"
          style={shimmerAccentStyle}
        />
      </div>

      {/* Trade items */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            data-testid={`skeleton-ticker-item-${i}`}
            className="grid grid-cols-3 gap-2 px-3 py-2"
          >
            <div
              className="h-4 bg-[#1a2234] rounded"
              style={shimmerAccentStyle}
            />
            <div
              className="h-4 bg-[#1a2234] rounded"
              style={shimmerStyle}
            />
            <div
              className="h-4 bg-[#1a2234] rounded ml-auto"
              style={shimmerStyle}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * LoadingState - Main component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  rowCount = 5,
  className = ''
}) => {
  const content = () => {
    switch (type) {
      case 'chart':
        return <ChartSkeleton />
      case 'stats':
        return <StatsSkeleton />
      case 'table':
        return <TableSkeleton rowCount={rowCount} />
      case 'ticker':
        return <TickerSkeleton />
      default:
        return null
    }
  }

  return (
    <div
      data-testid="loading-state"
      aria-label="Loading content"
      role="status"
      className={cn('animate-in fade-in duration-300', className)}
    >
      {/* Add shimmer animation via style tag */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>

      {content()}

      {/* Screen reader text */}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingState
