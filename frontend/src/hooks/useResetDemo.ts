import { useState, useCallback } from 'react'
import { loadDemoData } from '@/data/demoData'

export interface UseResetDemoReturn {
  isResetting: boolean
  resetDemo: () => Promise<void>
}

const STORAGE_KEYS = {
  ORDERS: 'carbonx_orders',
  PORTFOLIO: 'carbonx_portfolio',
  ORDER_HISTORY: 'carbonx_order_history'
} as const

/**
 * useResetDemo - Hook for resetting demo data to fresh state
 *
 * Features:
 * - Clears all existing localStorage data
 * - Loads fresh pre-populated demo data
 * - Provides loading state during reset
 * - Gracefully handles localStorage unavailability
 */
export function useResetDemo(): UseResetDemoReturn {
  const [isResetting, setIsResetting] = useState(false)

  const clearStorage = useCallback(() => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }

      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }, [])

  const resetDemo = useCallback(async () => {
    setIsResetting(true)

    try {
      // Clear existing data
      clearStorage()

      // Simulate network delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 300))

      // Load fresh demo data
      loadDemoData()
    } catch (error) {
      console.error('Failed to reset demo:', error)
    } finally {
      setIsResetting(false)
    }
  }, [clearStorage])

  return {
    isResetting,
    resetDemo
  }
}
