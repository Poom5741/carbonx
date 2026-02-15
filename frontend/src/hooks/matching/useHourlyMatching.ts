import { useState, useEffect, useCallback, useMemo } from 'react'

export type TimePeriod = 'day' | 'week' | 'month'

export interface HourlyData {
  hour: number
  generation: number // kWh
  consumption: number // kWh
  matched: boolean
  certificateId: string
}

export interface CertificateData {
  id: string
  location: string
  source: string
  cfePercentage: number
  matchedHours: number
  totalEnergy: number
  issuedAt: Date
  expiresAt: Date
  issuer: string
  certificateNumber: string
}

export interface Metadata {
  location: string
  timezone: string
  gridRegion: string
  iRecCompatible: boolean
  sources: string[]
}

const STORAGE_KEY = 'carbonx_hourly_matching'

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

interface StoredData {
  date: string
  data: HourlyData[]
}

const generateMockHourlyData = (): HourlyData[] => {
  return Array.from({ length: 24 }, (_, hour) => {
    // Simulate solar generation (peaks midday)
    const solarGeneration = Math.max(0, 50 * Math.sin((hour - 6) * Math.PI / 12))
    // Simulate wind generation (more variable)
    const windGeneration = 20 + Math.random() * 30
    const generation = solarGeneration + windGeneration

    // Consumption pattern (business hours)
    let consumption = 30
    if (hour >= 8 && hour <= 18) {
      consumption += 40 + Math.random() * 20
    } else if (hour >= 6 && hour < 8) {
      consumption += 20
    } else if (hour > 18 && hour <= 22) {
      consumption += 15
    }

    // Match if generation >= consumption
    const matched = generation >= consumption

    return {
      hour,
      generation: Math.round(generation * 10) / 10,
      consumption: Math.round(consumption * 10) / 10,
      matched,
      certificateId: `CERT-${Date.now()}-${hour}`,
    }
  })
}

const LOCATION_METADATA: Metadata = {
  location: 'WHA Vietnam, Phase 3',
  timezone: 'Asia/Ho_Chi_Minh',
  gridRegion: 'Southern Vietnam',
  iRecCompatible: true,
  sources: ['Solar', 'Wind'],
}

export function useHourlyMatching() {
  const [data, setData] = useState<HourlyData[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      setLoading(true)
      setError(null)
      try {
        const stored = safeGetItem<StoredData | null>(STORAGE_KEY, null)
        if (stored) {
          // Check if data is from today
          const storedDate = stored.date
          const today = new Date().toDateString()

          if (storedDate === today) {
            setData(stored.data)
            setLoading(false)
            return
          }
        }

        // Generate new data
        const newData = generateMockHourlyData()
        setData(newData)

        // Save to localStorage
        safeSetItem(STORAGE_KEY, {
          date: new Date().toDateString(),
          data: newData,
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load energy data')
        console.error('Failed to load hourly matching data:', error)
        setError(error)
        setData(generateMockHourlyData()) // Fallback to mock data
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate CFE percentage
  const cfePercentage = useMemo(() => {
    if (data.length === 0) return 0
    const matchedHours = data.filter(h => h.matched).length
    return Math.round((matchedHours / data.length) * 100)
  }, [data])

  // Calculate totals
  const totalGeneration = useMemo(() => {
    return data.reduce((sum, h) => sum + h.generation, 0)
  }, [data])

  const totalConsumption = useMemo(() => {
    return data.reduce((sum, h) => sum + h.consumption, 0)
  }, [data])

  const matchedEnergy = useMemo(() => {
    return data
      .filter(h => h.matched)
      .reduce((sum, h) => sum + Math.min(h.generation, h.consumption), 0)
  }, [data])

  // Get matched hours
  const getMatchedHours = useCallback(() => {
    return data.filter(h => h.matched)
  }, [data])

  // Get unmatched hours
  const getUnmatchedHours = useCallback(() => {
    return data.filter(h => !h.matched)
  }, [data])

  // Generate certificate data
  const generateCertificate = useCallback((): CertificateData => {
    const now = new Date()
    const expiry = new Date(now)
    expiry.setFullYear(expiry.getFullYear() + 1)

    const sources = LOCATION_METADATA.sources.join(' + ')

    return {
      id: `CERT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      location: LOCATION_METADATA.location,
      source: sources,
      cfePercentage,
      matchedHours: getMatchedHours().length,
      totalEnergy: Math.round(matchedEnergy * 10) / 10,
      issuedAt: now,
      expiresAt: expiry,
      issuer: 'CarbonX Energy Registry',
      certificateNumber: `I-REC-${Date.now()}-${Math.floor(Math.random() * 1000000000)}`,
    }
  }, [cfePercentage, getMatchedHours, matchedEnergy])

  // Export certificate
  const exportCertificate = useCallback((format: 'json' | 'csv' = 'json') => {
    const certificate = generateCertificate()

    if (format === 'json') {
      const dataStr = JSON.stringify(certificate, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${certificate.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      const headers = ['ID', 'Location', 'Source', 'CFE %', 'Matched Hours', 'Total Energy', 'Issued At']
      const values = [
        certificate.id,
        certificate.location,
        certificate.source,
        certificate.cfePercentage,
        certificate.matchedHours,
        certificate.totalEnergy,
        certificate.issuedAt.toISOString(),
      ]
      const csvContent = [headers.join(','), values.join(',')].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${certificate.id}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    return certificate
  }, [generateCertificate])

  // Refresh data (with error handling)
  const refresh = useCallback(() => {
    setError(null)
    try {
      const newData = generateMockHourlyData()
      setData(newData)
      safeSetItem(STORAGE_KEY, {
        date: new Date().toDateString(),
        data: newData,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh data')
      setError(error)
    }
  }, [])

  // Retry function for error recovery
  const retry = useCallback(() => {
    setError(null)
    setLoading(true)
    // Simulate retry delay
    setTimeout(() => {
      try {
        const newData = generateMockHourlyData()
        setData(newData)
        safeSetItem(STORAGE_KEY, {
          date: new Date().toDateString(),
          data: newData,
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to retry data load')
        setError(error)
      } finally {
        setLoading(false)
      }
    }, 1000)
  }, [])

  return {
    data,
    loading,
    error,
    timePeriod,
    setTimePeriod,
    cfePercentage,
    totalGeneration,
    totalConsumption,
    matchedEnergy,
    getMatchedHours,
    getUnmatchedHours,
    generateCertificate,
    exportCertificate,
    refresh,
    retry,
    metadata: LOCATION_METADATA,
  }
}
