import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCFECompliance } from './useCFECompliance'

describe('useCFECompliance - Hourly CFE Compliance Tracking (TDG)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should initialize with zero compliance when no data', () => {
      const { result } = renderHook(() => useCFECompliance())
      expect(result.current.compliancePercent).toBe(0)
      expect(result.current.isCompliant).toBe(false)
    })

    it('should initialize with empty hourly data', () => {
      const { result } = renderHook(() => useCFECompliance())
      expect(result.current.hourlyData).toEqual([])
    })

    it('should initialize with current hour as default', () => {
      const { result } = renderHook(() => useCFECompliance())
      expect(result.current.currentHour).toBeDefined()
      expect(result.current.currentHour).toBeGreaterThanOrEqual(0)
      expect(result.current.currentHour).toBeLessThan(24)
    })
  })

  describe('Hourly Matching Calculation', () => {
    it('should calculate matching percentage for a single hour', async () => {
      const { result } = renderHook(() => useCFECompliance(50)) // 50% threshold

      act(() => {
        result.current.recordHourlyTrade(100, 80) // 100 required, 80 matched
      })

      await waitFor(() => {
        expect(result.current.compliancePercent).toBe(80)
      })
    })

    it('should handle 100% matching', async () => {
      const { result } = renderHook(() => useCFECompliance(50))

      act(() => {
        result.current.recordHourlyTrade(100, 100)
      })

      await waitFor(() => {
        expect(result.current.compliancePercent).toBe(100)
        expect(result.current.isCompliant).toBe(true)
      })
    })

    it('should handle 0% matching', async () => {
      const { result } = renderHook(() => useCFECompliance(50))

      act(() => {
        result.current.recordHourlyTrade(100, 0)
      })

      await waitFor(() => {
        expect(result.current.compliancePercent).toBe(0)
        expect(result.current.isCompliant).toBe(false)
      })
    })

    it('should calculate average across multiple hours', async () => {
      const { result } = renderHook(() => useCFECompliance(50))

      act(() => {
        result.current.recordHourlyTrade(100, 80) // 80%
        result.current.recordHourlyTrade(100, 60) // 60%
        result.current.recordHourlyTrade(100, 100) // 100%
      })

      await waitFor(() => {
        // Average: (80 + 60 + 100) / 3 = 80%
        expect(result.current.compliancePercent).toBe(80)
      })
    })
  })

  describe('Compliance Threshold', () => {
    it('should be compliant when above threshold', async () => {
      const { result } = renderHook(() => useCFECompliance(70))

      act(() => {
        result.current.recordHourlyTrade(100, 75) // 75% > 70%
      })

      await waitFor(() => {
        expect(result.current.isCompliant).toBe(true)
      })
    })

    it('should not be compliant when below threshold', async () => {
      const { result } = renderHook(() => useCFECompliance(70))

      act(() => {
        result.current.recordHourlyTrade(100, 65) // 65% < 70%
      })

      await waitFor(() => {
        expect(result.current.isCompliant).toBe(false)
      })
    })

    it('should be compliant at exact threshold', async () => {
      const { result } = renderHook(() => useCFECompliance(70))

      act(() => {
        result.current.recordHourlyTrade(100, 70) // 70% = 70%
      })

      await waitFor(() => {
        expect(result.current.isCompliant).toBe(true)
      })
    })
  })

  describe('Hourly Data Structure', () => {
    it('should store hourly data with correct structure', async () => {
      const { result } = renderHook(() => useCFECompliance())

      act(() => {
        result.current.recordHourlyTrade(100, 80)
      })

      await waitFor(() => {
        expect(result.current.hourlyData.length).toBe(1)
        expect(result.current.hourlyData[0]).toMatchObject({
          hour: expect.any(Number),
          required: 100,
          matched: 80,
          percentage: 80
        })
      })
    })

    it('should aggregate trades by hour', async () => {
      const { result } = renderHook(() => useCFECompliance())

      // Mock the current hour to be consistent
      const testHour = 10
      vi.spyOn(Date.prototype, 'getHours').mockReturnValue(testHour)

      act(() => {
        result.current.recordHourlyTrade(50, 40)
        result.current.recordHourlyTrade(50, 30) // Same hour
      })

      await waitFor(() => {
        expect(result.current.hourlyData.length).toBe(1)
        expect(result.current.hourlyData[0].matched).toBe(70) // Aggregated
      })
    })

    it('should separate different hours', async () => {
      const { result } = renderHook(() => useCFECompliance())

      let hourCallCount = 0
      vi.spyOn(Date.prototype, 'getHours').mockImplementation(() => {
        return hourCallCount++ < 2 ? 10 : 11
      })

      act(() => {
        result.current.recordHourlyTrade(50, 40)
        result.current.recordHourlyTrade(50, 30)
        hourCallCount = 2 // Switch to hour 11
        result.current.recordHourlyTrade(50, 50)
      })

      await waitFor(() => {
        expect(result.current.hourlyData.length).toBe(2)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero required amount', () => {
      const { result } = renderHook(() => useCFECompliance())

      act(() => {
        result.current.recordHourlyTrade(0, 0)
      })

      // State should remain unchanged
      expect(result.current.compliancePercent).toBe(0)
    })

    it('should handle matched greater than required', async () => {
      const { result } = renderHook(() => useCFECompliance())

      act(() => {
        result.current.recordHourlyTrade(100, 120) // Over-matched
      })

      await waitFor(() => {
        expect(result.current.compliancePercent).toBe(100) // Cap at 100%
      })
    })

    it('should handle negative values gracefully', () => {
      const { result } = renderHook(() => useCFECompliance())

      act(() => {
        result.current.recordHourlyTrade(-100, -50)
      })

      // State should remain unchanged
      expect(result.current.compliancePercent).toBe(0)
    })
  })

  describe('Data Persistence', () => {
    it('should save to localStorage on updates', async () => {
      const { result } = renderHook(() => useCFECompliance())

      act(() => {
        result.current.recordHourlyTrade(100, 80)
      })

      await waitFor(() => {
        const stored = localStorage.getItem('carbonx_cfe_compliance')
        expect(stored).toBeDefined()
        expect(JSON.parse(stored!)).toMatchObject({
          threshold: 50,
          hourlyData: expect.any(Array)
        })
      })
    })

    it('should load from localStorage on mount', () => {
      const existingData = {
        threshold: 70,
        hourlyData: [
          { hour: 10, required: 100, matched: 80, percentage: 80 }
        ]
      }
      localStorage.setItem('carbonx_cfe_compliance', JSON.stringify(existingData))

      const { result } = renderHook(() => useCFECompliance(70))

      expect(result.current.hourlyData.length).toBe(1)
      expect(result.current.hourlyData[0].matched).toBe(80)
    })
  })

  describe('Reset Functionality', () => {
    it('should clear all data on reset', async () => {
      const { result } = renderHook(() => useCFECompliance())

      act(() => {
        result.current.recordHourlyTrade(100, 80)
      })

      await waitFor(() => {
        expect(result.current.hourlyData.length).toBe(1)
      })

      act(() => {
        result.current.reset()
      })

      await waitFor(() => {
        expect(result.current.hourlyData).toEqual([])
        expect(result.current.compliancePercent).toBe(0)
      })
    })

    it('should clear localStorage on reset', async () => {
      const { result } = renderHook(() => useCFECompliance())

      act(() => {
        result.current.recordHourlyTrade(100, 80)
      })

      await waitFor(() => {
        expect(localStorage.getItem('carbonx_cfe_compliance')).toBeDefined()
      })

      act(() => {
        result.current.reset()
      })

      await waitFor(() => {
        expect(localStorage.getItem('carbonx_cfe_compliance')).toBeNull()
      })
    })
  })

  describe('24-Hour Window', () => {
    it('should only keep last 24 hours of data', async () => {
      const { result } = renderHook(() => useCFECompliance())

      // Add 25 hours of data
      for (let i = 0; i < 25; i++) {
        vi.spyOn(Date.prototype, 'getHours').mockReturnValue(i % 24)
        act(() => {
          result.current.recordHourlyTrade(100, 80)
        })
      }

      await waitFor(() => {
        // Should only keep last 24 hours
        expect(result.current.hourlyData.length).toBeLessThanOrEqual(24)
      })
    })
  })
})
