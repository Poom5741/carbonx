/**
 * Timeframe configuration for chart data
 * Defines available time intervals and their properties
 */

export type TimeframeKey = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W'

export interface TimeframeConfig {
  intervalMinutes: number
  displayLabel: string
}

export type TimeframeConfigMap = Record<TimeframeKey, TimeframeConfig>

/**
 * Default number of minutes of historical data to display
 * This gives us 100 data points for 1-minute candles
 */
const DEFAULT_TIME_RANGE_MINUTES = 100

/**
 * Get the configuration for all available timeframes
 */
export function getTimeframeConfig(): TimeframeConfigMap {
  return {
    '1m': { intervalMinutes: 1, displayLabel: '1m' },
    '5m': { intervalMinutes: 5, displayLabel: '5m' },
    '15m': { intervalMinutes: 15, displayLabel: '15m' },
    '1H': { intervalMinutes: 60, displayLabel: '1H' },
    '4H': { intervalMinutes: 240, displayLabel: '4H' },
    '1D': { intervalMinutes: 1440, displayLabel: '1D' }, // 24 * 60
    '1W': { intervalMinutes: 10080, displayLabel: '1W' }, // 7 * 24 * 60
  }
}

/**
 * Calculate the number of data points needed for a given timeframe
 * Based on the default time range and the interval minutes
 */
export function getDataPointCount(timeframe: TimeframeKey): number {
  const config = getTimeframeConfig()
  const intervalMinutes = config[timeframe].intervalMinutes

  // Calculate number of data points needed to cover the time range
  const dataPoints = Math.floor(DEFAULT_TIME_RANGE_MINUTES / intervalMinutes)

  // Always return at least 1 data point
  return Math.max(dataPoints, 1)
}
