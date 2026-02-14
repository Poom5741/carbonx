/**
 * Format a number as currency (USDT)
 * @param value - The number value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a number as percentage
 * @param value - The number value to format (e.g., 0.025 for 2.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string with sign
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Format a number with specified decimal places
 * @param value - The number value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

/**
 * Determine if a change is positive or negative
 * @param value - The numeric change value
 * @returns 'positive' or 'negative'
 */
export function getChangeType(value: number): 'positive' | 'negative' {
  return value >= 0 ? 'positive' : 'negative'
}
