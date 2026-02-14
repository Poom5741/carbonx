/**
 * Format a number as USD currency with commas
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

/**
 * Format a number as a percentage with + sign for positive values
 * @param value - The number to format
 * @returns Formatted percentage string (e.g., "+2.4%" or "-1.2%")
 */
export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}
