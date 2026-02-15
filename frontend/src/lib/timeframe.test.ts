import { describe, it, expect } from 'vitest'
import { getTimeframeConfig, getDataPointCount, type TimeframeKey } from './timeframe'

describe('timeframe config', () => {
  it('should have all required timeframes with correct intervals', () => {
    const config = getTimeframeConfig()

    // Check all required timeframes exist
    expect(config).toHaveProperty('1m')
    expect(config).toHaveProperty('5m')
    expect(config).toHaveProperty('15m')
    expect(config).toHaveProperty('1H')
    expect(config).toHaveProperty('4H')
    expect(config).toHaveProperty('1D')
    expect(config).toHaveProperty('1W')

    // Check specific interval values
    expect(config['1m'].intervalMinutes).toBe(1)
    expect(config['5m'].intervalMinutes).toBe(5)
    expect(config['15m'].intervalMinutes).toBe(15)
    expect(config['1H'].intervalMinutes).toBe(60)
    expect(config['4H'].intervalMinutes).toBe(240)
    expect(config['1D'].intervalMinutes).toBe(1440) // 24 * 60
    expect(config['1W'].intervalMinutes).toBe(10080) // 7 * 24 * 60
  })

  it('should have displayLabel for each timeframe', () => {
    const config = getTimeframeConfig()

    expect(config['1m'].displayLabel).toBe('1m')
    expect(config['5m'].displayLabel).toBe('5m')
    expect(config['15m'].displayLabel).toBe('15m')
    expect(config['1H'].displayLabel).toBe('1H')
    expect(config['4H'].displayLabel).toBe('4H')
    expect(config['1D'].displayLabel).toBe('1D')
    expect(config['1W'].displayLabel).toBe('1W')
  })

  it('should return all timeframe keys in order', () => {
    const config = getTimeframeConfig()
    const keys = Object.keys(config) as TimeframeKey[]

    expect(keys).toEqual(['1m', '5m', '15m', '1H', '4H', '1D', '1W'])
  })
})

describe('data point calculation', () => {
  it('should calculate correct number of data points for timeframe', () => {
    const points1m = getDataPointCount('1m')
    const points1h = getDataPointCount('1H')

    // 1h should have fewer points than 1m for same time range
    expect(points1h).toBeLessThan(points1m)
    expect(points1h).toBe(Math.floor(points1m / 60))
  })

  it('should calculate correct data points for 5m timeframe', () => {
    const points1m = getDataPointCount('1m')
    const points5m = getDataPointCount('5m')

    expect(points5m).toBe(Math.floor(points1m / 5))
  })

  it('should calculate correct data points for 15m timeframe', () => {
    const points1m = getDataPointCount('1m')
    const points15m = getDataPointCount('15m')

    expect(points15m).toBe(Math.floor(points1m / 15))
  })

  it('should calculate correct data points for 4H timeframe', () => {
    const points4h = getDataPointCount('4H')

    // With 240min interval and 100min range, we get 0 but clamp to 1
    expect(points4h).toBe(1)
  })

  it('should calculate correct data points for 1D timeframe', () => {
    const points1d = getDataPointCount('1D')

    // With 1440min interval and 100min range, we get 0 but clamp to 1
    expect(points1d).toBe(1)
  })

  it('should calculate correct data points for 1W timeframe', () => {
    const points1w = getDataPointCount('1W')

    // With 10080min interval and 100min range, we get 0 but clamp to 1
    expect(points1w).toBe(1)
  })

  it('should return at least 1 data point for all timeframes', () => {
    const timeframes: TimeframeKey[] = ['1m', '5m', '15m', '1H', '4H', '1D', '1W']

    timeframes.forEach(timeframe => {
      const points = getDataPointCount(timeframe)
      expect(points).toBeGreaterThanOrEqual(1)
    })
  })

  it('should have consistent data point count across multiple calls', () => {
    const points1a = getDataPointCount('1m')
    const points1b = getDataPointCount('1m')

    expect(points1a).toBe(points1b)
  })
})
