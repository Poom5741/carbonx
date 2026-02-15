import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHourlyMatching } from './useHourlyMatching'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
    removeItem: (key: string) => { delete store[key] },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

describe('useHourlyMatching', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with default hourly data and provide all expected values', async () => {
    const { result } = renderHook(() => useHourlyMatching())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Check data structure
    expect(result.current.data).toBeDefined()
    expect(result.current.data.length).toBe(24)

    // Verify each hour has correct structure
    result.current.data.forEach((hour, index) => {
      expect(hour).toHaveProperty('hour', index)
      expect(hour).toHaveProperty('generation')
      expect(hour).toHaveProperty('consumption')
      expect(hour).toHaveProperty('matched')
      expect(hour).toHaveProperty('certificateId')
      expect(typeof hour.generation).toBe('number')
      expect(typeof hour.consumption).toBe('number')
      expect(typeof hour.matched).toBe('boolean')
    })

    // Check CFE calculation
    const matchedHours = result.current.data.filter(h => h.matched).length
    const expectedCFE = Math.round((matchedHours / 24) * 100)
    expect(result.current.cfePercentage).toBe(expectedCFE)

    // Check total energy calculations
    const totalGeneration = result.current.data.reduce((sum, h) => sum + h.generation, 0)
    const totalConsumption = result.current.data.reduce((sum, h) => sum + h.consumption, 0)
    expect(result.current.totalGeneration).toBe(totalGeneration)
    expect(result.current.totalConsumption).toBe(totalConsumption)

    // Check metadata
    expect(result.current.metadata).toHaveProperty('location', 'WHA Vietnam, Phase 3')
    expect(result.current.metadata).toHaveProperty('timezone')
    expect(result.current.metadata).toHaveProperty('gridRegion')
    expect(result.current.metadata).toHaveProperty('iRecCompatible', true)
  })

  it('should handle time period changes', async () => {
    const { result } = renderHook(() => useHourlyMatching())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Initial state
    expect(result.current.timePeriod).toBe('day')

    // Change to week using act to ensure state update is processed
    await act(async () => {
      result.current.setTimePeriod('week')
    })

    expect(result.current.timePeriod).toBe('week')

    // Change to month
    await act(async () => {
      result.current.setTimePeriod('month')
    })

    expect(result.current.timePeriod).toBe('month')
  })

  it('should generate certificate data', async () => {
    const { result } = renderHook(() => useHourlyMatching())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const certificate = result.current.generateCertificate()

    expect(certificate).toHaveProperty('id')
    expect(certificate).toHaveProperty('location')
    expect(certificate).toHaveProperty('source')
    expect(certificate).toHaveProperty('cfePercentage')
    expect(certificate).toHaveProperty('matchedHours')
    expect(certificate).toHaveProperty('totalEnergy')
    expect(certificate).toHaveProperty('issuedAt')
    expect(certificate).toHaveProperty('expiresAt')

    expect(certificate.location).toBe('WHA Vietnam, Phase 3')
    expect(certificate.source).toContain('Solar')
    expect(certificate.source).toContain('Wind')
  })

  it('should filter matched and unmatched hours', async () => {
    const { result } = renderHook(() => useHourlyMatching())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const matchedHours = result.current.getMatchedHours()
    const unmatchedHours = result.current.getUnmatchedHours()

    // Verify all matched hours are actually matched
    matchedHours.forEach(hour => {
      expect(hour.matched).toBe(true)
    })

    // Verify all unmatched hours are actually unmatched
    unmatchedHours.forEach(hour => {
      expect(hour.matched).toBe(false)
    })

    // Together they should equal all hours
    expect(matchedHours.length + unmatchedHours.length).toBe(24)
  })

  it('should export certificate as JSON', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')

    const { result } = renderHook(() => useHourlyMatching())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const certificate = result.current.exportCertificate('json')

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
    expect(certificate).toHaveProperty('id')

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
    createObjectURLSpy.mockRestore()
    revokeObjectURLSpy.mockRestore()
  })

  it('should refresh data', async () => {
    const { result } = renderHook(() => useHourlyMatching())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const originalData = [...result.current.data]

    // Refresh
    await act(async () => {
      result.current.refresh()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Data should have same structure
    expect(result.current.data.length).toBe(24)
    expect(result.current.data[0].hour).toBe(originalData[0].hour)
  })
})
