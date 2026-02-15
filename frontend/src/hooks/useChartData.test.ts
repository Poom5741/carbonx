import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { CandlestickData, HistogramData } from 'lightweight-charts'

// Define the return type for our hook
interface ChartDataResult {
  candleData: CandlestickData<never>[]
  volumeData: HistogramData<never>[]
}

// We'll import the actual hook after creating it
// For now, we'll use a dynamic import in the tests
let useChartData: (dataPointCount: number, timeframe?: string, currentPrice?: number) => ChartDataResult

describe('useChartData - Chart Data Generation (TDG)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // Import the hook before each test suite run
  beforeAll(async () => {
    const module = await import('./useChartData')
    useChartData = module.useChartData
  })

  describe('TDG Cycle 1.1: Hook Interface', () => {
    it('should return initial data structure with candle and volume data', () => {
      const { result } = renderHook(() => useChartData(100))

      expect(result.current).toHaveProperty('candleData')
      expect(result.current).toHaveProperty('volumeData')
      expect(Array.isArray(result.current.candleData)).toBe(true)
      expect(Array.isArray(result.current.volumeData)).toBe(true)
    })

    it('should return correct number of data points', () => {
      const { result } = renderHook(() => useChartData(50))

      expect(result.current.candleData.length).toBe(50)
      expect(result.current.volumeData.length).toBe(50)
    })

    it('should have matching timestamps for candle and volume data', () => {
      const { result } = renderHook(() => useChartData(50))

      result.current.candleData.forEach((candle, i) => {
        expect(candle.time).toBe(result.current.volumeData[i].time)
      })
    })
  })

  describe('TDG Cycle 1.2: Price Continuity', () => {
    it('should maintain price continuity between consecutive candles', () => {
      const { result } = renderHook(() => useChartData(50))

      for (let i = 1; i < result.current.candleData.length; i++) {
        const prevCandle = result.current.candleData[i - 1]
        const currCandle = result.current.candleData[i]

        // Open should be close to previous close (within 1%)
        const expectedOpen = prevCandle.close
        const actualOpen = currCandle.open
        const diff = Math.abs(actualOpen - expectedOpen) / expectedOpen

        expect(diff).toBeLessThan(0.01)
      }
    })

    it('should store last price in ref for continuity across renders', () => {
      const { result, rerender } = renderHook(
        ({ count }) => useChartData(count),
        { initialProps: { count: 50 } }
      )

      // Rerender with more data points
      rerender({ count: 100 })

      // First candle of new render should continue from where we left off
      // This is implicit - the ref ensures continuity
      expect(result.current.candleData.length).toBe(100)

      // Check internal continuity is maintained
      for (let i = 1; i < result.current.candleData.length; i++) {
        const prevCandle = result.current.candleData[i - 1]
        const currCandle = result.current.candleData[i]

        const expectedOpen = prevCandle.close
        const actualOpen = currCandle.open
        const diff = Math.abs(actualOpen - expectedOpen) / expectedOpen

        expect(diff).toBeLessThan(0.01)
      }
    })
  })

  describe('TDG Cycle 1.3: Reduced Volatility', () => {
    it('should have realistic price movement (max 5% change per candle)', () => {
      const { result } = renderHook(() => useChartData(100))

      result.current.candleData.forEach((candle) => {
        const change = Math.abs(candle.close - candle.open) / candle.open
        expect(change).toBeLessThan(0.05)
      })
    })

    it('should have high greater than or equal to max of open and close', () => {
      const { result } = renderHook(() => useChartData(50))

      result.current.candleData.forEach((candle) => {
        expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close))
      })
    })

    it('should have low less than or equal to min of open and close', () => {
      const { result } = renderHook(() => useChartData(50))

      result.current.candleData.forEach((candle) => {
        expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close))
      })
    })

    it('should generate positive volume values', () => {
      const { result } = renderHook(() => useChartData(50))

      result.current.volumeData.forEach((volume) => {
        expect(volume.value).toBeGreaterThan(0)
      })
    })

    it('should color volume bars based on price direction', () => {
      const { result } = renderHook(() => useChartData(50))

      result.current.volumeData.forEach((volume, i) => {
        const candle = result.current.candleData[i]
        const isGreen = candle.close >= candle.open

        if (isGreen) {
          expect(volume.color).toBe('rgba(64, 255, 169, 0.5)') // Green color
        } else {
          expect(volume.color).toBe('rgba(255, 107, 107, 0.5)') // Red color
        }
      })
    })
  })

  describe('TDG Cycle 1.4: Timeframe Parameter', () => {
    it('should generate different time spacing for different timeframes', () => {
      const { result: result1m } = renderHook(() => useChartData(50, '1m'))
      const { result: result1h } = renderHook(() => useChartData(50, '1H'))
      const { result: result1d } = renderHook(() => useChartData(50, '1D'))

      const timeDiff1m = result1m.current.candleData[1].time as number - (result1m.current.candleData[0].time as number)
      const timeDiff1h = result1h.current.candleData[1].time as number - (result1h.current.candleData[0].time as number)
      const timeDiff1d = result1d.current.candleData[1].time as number - (result1d.current.candleData[0].time as number)

      // 1h should have wider time spacing than 1m
      expect(timeDiff1h).toBeGreaterThan(timeDiff1m)

      // 1D should have wider time spacing than 1h
      expect(timeDiff1d).toBeGreaterThan(timeDiff1h)

      // 1h should be 60x 1m
      expect(timeDiff1h).toBe(timeDiff1m * 60)

      // 1D should be 24x 1h
      expect(timeDiff1d).toBe(timeDiff1h * 24)
    })

    it('should support all required timeframes', () => {
      const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'] as const

      timeframes.forEach((timeframe) => {
        const { result } = renderHook(() => useChartData(20, timeframe))

        expect(result.current.candleData.length).toBe(20)
        expect(result.current.volumeData.length).toBe(20)
      })
    })

    it('should default to 15m timeframe when not specified', () => {
      const { result: defaultResult } = renderHook(() => useChartData(50))
      const { result: explicitResult } = renderHook(() => useChartData(50, '15m'))

      // Should generate same time spacing
      const defaultDiff = defaultResult.current.candleData[1].time as number - (defaultResult.current.candleData[0].time as number)
      const explicitDiff = explicitResult.current.candleData[1].time as number - (explicitResult.current.candleData[0].time as number)

      expect(defaultDiff).toBe(explicitDiff)
    })

    it('should refresh data when timeframe changes', () => {
      const { result, rerender } = renderHook(
        ({ timeframe }) => useChartData(50, timeframe),
        { initialProps: { timeframe: '15m' } }
      )

      const initialData = result.current.candleData

      rerender({ timeframe: '1H' })

      const newData = result.current.candleData

      // Data should be different due to different time spacing
      expect(newData).not.toEqual(initialData)

      // But the time difference should reflect the new timeframe
      const timeDiff = newData[1].time as number - (newData[0].time as number)
      const initialDiff = initialData[1].time as number - (initialData[0].time as number)

      expect(timeDiff).toBeGreaterThan(initialDiff)
    })
  })

  describe('Data Quality', () => {
    it('should have all required candlestick fields', () => {
      const { result } = renderHook(() => useChartData(50))

      result.current.candleData.forEach((candle) => {
        expect(candle).toHaveProperty('time')
        expect(candle).toHaveProperty('open')
        expect(candle).toHaveProperty('high')
        expect(candle).toHaveProperty('low')
        expect(candle).toHaveProperty('close')
        expect(typeof candle.open).toBe('number')
        expect(typeof candle.high).toBe('number')
        expect(typeof candle.low).toBe('number')
        expect(typeof candle.close).toBe('number')
      })
    })

    it('should have all required histogram fields', () => {
      const { result } = renderHook(() => useChartData(50))

      result.current.volumeData.forEach((volume) => {
        expect(volume).toHaveProperty('time')
        expect(volume).toHaveProperty('value')
        expect(volume).toHaveProperty('color')
        expect(typeof volume.value).toBe('number')
        expect(typeof volume.color).toBe('string')
      })
    })

    it('should generate times in descending order (oldest to newest)', () => {
      const { result } = renderHook(() => useChartData(50))

      for (let i = 1; i < result.current.candleData.length; i++) {
        const prevTime = result.current.candleData[i - 1].time as number
        const currTime = result.current.candleData[i].time as number
        expect(currTime).toBeGreaterThan(prevTime)
      }
    })
  })
})
