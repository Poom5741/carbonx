import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

export interface HourlyComplianceData {
  hour: number
  required: number
  matched: number
  percentage: number
}

export interface CFEComplianceData {
  compliancePercent: number
  isCompliant: boolean
  currentHour: number
  hourlyData: HourlyComplianceData[]
  recordHourlyTrade: (required: number, matched: number) => void
  reset: () => void
}

const STORAGE_KEY = 'carbonx_cfe_compliance'

// Safe localStorage helpers with error handling
const safeSetItem = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(`localStorage quota exceeded for ${key}, using in-memory only`)
    } else {
      console.warn(`localStorage unavailable for ${key}`, error)
    }
  }
}

const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch (error) {
    console.warn(`Corrupted data in ${key}, using defaults`, error)
    return defaultValue
  }
}

const safeRemoveItem = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage`, error)
  }
}

/**
 * useCFECompliance - Tracks hourly CFE (Carbon Free Energy) compliance
 *
 * Features:
 * - Records hourly required vs matched energy trading
 * - Calculates compliance percentage
 * - Validates against configurable threshold
 * - Persists data to localStorage
 * - Maintains 24-hour rolling window
 *
 * @param threshold - Minimum percentage required for compliance (default: 50)
 */
export function useCFECompliance(threshold: number = 50): CFEComplianceData {
  const [hourlyData, setHourlyData] = useState<HourlyComplianceData[]>([])
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const isResettingRef = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    const data = safeGetItem<{ threshold: number; hourlyData: HourlyComplianceData[] } | null>(
      STORAGE_KEY,
      null
    )
    if (data?.hourlyData) {
      setHourlyData(data.hourlyData)
    }
  }, [])

  // Save to localStorage on changes (skip if resetting)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    // Don't save if we're in the middle of a reset
    if (isResettingRef.current) {
      isResettingRef.current = false
      return
    }

    // Only save if we have data
    if (hourlyData.length > 0) {
      safeSetItem(STORAGE_KEY, { threshold, hourlyData })
    }
  }, [threshold, hourlyData])

  // Update current hour every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Calculate overall compliance percentage
  const compliancePercent = useMemo(() => {
    if (hourlyData.length === 0) return 0

    const totalPercentage = hourlyData.reduce((sum, entry) => sum + entry.percentage, 0)
    return Math.round(totalPercentage / hourlyData.length)
  }, [hourlyData])

  // Check if compliant
  const isCompliant = useMemo(() => {
    return compliancePercent >= threshold
  }, [compliancePercent, threshold])

  // Record hourly trade
  const recordHourlyTrade = useCallback((required: number, matched: number) => {
    // Handle edge cases
    if (required <= 0 || matched < 0) {
      return
    }

    const hour = new Date().getHours()
    const percentage = Math.min(100, Math.round((matched / required) * 100))

    setHourlyData(prev => {
      // Check if we already have data for this hour
      const existingIndex = prev.findIndex(entry => entry.hour === hour)

      if (existingIndex >= 0) {
        // Update existing hour
        const updated = [...prev]
        updated[existingIndex] = {
          hour,
          required: updated[existingIndex].required + required,
          matched: updated[existingIndex].matched + matched,
          percentage: Math.min(100, Math.round(
            ((updated[existingIndex].matched + matched) / (updated[existingIndex].required + required)) * 100
          ))
        }
        return updated
      } else {
        // Add new hour
        const newData = [...prev, { hour, required, matched, percentage }]

        // Keep only last 24 hours
        if (newData.length > 24) {
          return newData.slice(-24)
        }

        return newData
      }
    })
  }, [])

  // Reset all data
  const reset = useCallback(() => {
    isResettingRef.current = true
    setHourlyData([])

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      safeRemoveItem(STORAGE_KEY)
    }
  }, [])

  return {
    compliancePercent,
    isCompliant,
    currentHour,
    hourlyData,
    recordHourlyTrade,
    reset
  }
}
