import { useMemo } from 'react'
import type { CandlestickData, HistogramData } from 'lightweight-charts'

/**
 * Timeframe configuration mapping to interval in seconds
 */
const TIMEFRAME_INTERVALS: Record<string, number> = {
  '1m': 60,           // 1 minute
  '5m': 5 * 60,       // 5 minutes
  '15m': 15 * 60,     // 15 minutes
  '1H': 60 * 60,      // 1 hour
  '4H': 4 * 60 * 60,  // 4 hours
  '1D': 24 * 60 * 60, // 1 day
  '1W': 7 * 24 * 60 * 60, // 1 week
} as const

export type Timeframe = keyof typeof TIMEFRAME_INTERVALS

/**
 * Chart data result type
 */
export interface ChartDataResult {
  candleData: CandlestickData<never>[]
  volumeData: HistogramData<never>[]
}

/**
 * Maximum price change per candle (5%)
 */
const MAX_VOLATILITY = 0.05

/**
 * High/Low volatility range (2%)
 */
const HIGH_LOW_VOLATILITY = 0.02

/**
 * Generate realistic candlestick and volume chart data
 *
 * Features:
 * - Static chart data (only regenerates on timeframe/dataPointCount change)
 * - Reduced volatility (max 5% change per candle)
 * - Configurable timeframe support
 * - Proper OHLC data structure
 * - Volume bars colored by price direction
 * - Anchored to current market price
 *
 * @param dataPointCount - Number of data points to generate
 * @param timeframe - Timeframe interval (default: '15m')
 * @param currentPrice - Current market price to anchor chart (default: 100)
 * @returns Chart data with candlestick and volume arrays
 */
export function useChartData(
  dataPointCount: number,
  timeframe: Timeframe = '15m',
  currentPrice: number = 100
): ChartDataResult {
  // Get interval in seconds for the timeframe
  const intervalSeconds = TIMEFRAME_INTERVALS[timeframe] || TIMEFRAME_INTERVALS['15m']

  const chartData = useMemo(() => {
    const candleData: CandlestickData<never>[] = []
    const volumeData: HistogramData<never>[] = []

    // Start from 85% of current market price for static chart
    let price = currentPrice * 0.85

    // Current time (using Unix timestamp in seconds)
    const now = Math.floor(Date.now() / 1000)

    // Generate data from oldest to newest
    for (let i = dataPointCount - 1; i >= 0; i--) {
      // Calculate time for this candle (going backwards from now)
      const time = now - (i * intervalSeconds)

      // Generate OHLC data with reduced volatility
      const open = price
      const changePercent = (Math.random() - 0.45) * MAX_VOLATILITY // Slight upward bias
      const close = open * (1 + changePercent)

      // Generate high and low with volatility
      const high = Math.max(open, close) * (1 + Math.random() * HIGH_LOW_VOLATILITY)
      const low = Math.min(open, close) * (1 - Math.random() * HIGH_LOW_VOLATILITY)

      // Generate random volume
      const volume = Math.random() * 1000000

      // Create candle data point
      candleData.push({
        time: time as never,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      })

      // Create volume data point with color based on price direction
      const isGreen = close >= open
      volumeData.push({
        time: time as never,
        value: volume,
        color: isGreen ? 'rgba(64, 255, 169, 0.5)' : 'rgba(255, 107, 107, 0.5)',
      })

      // Update price for next candle
      price = close
    }

    return { candleData, volumeData }
  }, [dataPointCount, intervalSeconds, currentPrice])

  return chartData
}
