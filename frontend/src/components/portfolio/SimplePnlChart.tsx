import React, { useEffect, useRef } from 'react'
import { createChart, AreaSeries } from 'lightweight-charts'
import type { Order } from '@/hooks/useTrading'

interface SimplePnlChartProps {
  initialValue: number
  currentValue: number
  orderHistory?: Order[]
}

export const SimplePnlChart: React.FC<SimplePnlChartProps> = ({
  initialValue,
  currentValue,
  orderHistory = [],
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<ReturnType<typeof createChart> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#111827' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
    })

    const series = chart.addSeries(AreaSeries, {
      lineColor: currentValue >= initialValue ? '#40ffa9' : '#f87171',
      topColor: currentValue >= initialValue ? 'rgba(64, 255, 169, 0.4)' : 'rgba(248, 113, 113, 0.4)',
      bottomColor: currentValue >= initialValue ? 'rgba(64, 255, 169, 0)' : 'rgba(248, 113, 113, 0)',
    })

    // Generate chart data from order history
    const now = Date.now()
    const dayInSeconds = 24 * 60 * 60

    // Helper to convert timestamp to YYYY-MM-DD format for lightweight-charts
    const toDateString = (timestamp: number): string => {
      return new Date(timestamp).toISOString().split('T')[0]
    }

    // Aggregate orders by date and calculate portfolio value
    // This ensures no duplicate time entries in the chart data
    const portfolioValueByDate = new Map<string, number>()

    // Start with initial balance (30 days ago)
    const startTime = now - 30 * dayInSeconds
    portfolioValueByDate.set(toDateString(startTime), initialValue)

    // Process order history to build portfolio value over time
    let currentValueAtPoint = initialValue

    if (orderHistory.length > 0) {
      // Sort orders by timestamp
      const sortedHistory = [...orderHistory].sort(
        (a, b) => (a.createdAt || a.filledAt || 0) - (b.createdAt || b.filledAt || 0)
      )

      // Aggregate orders by date
      const ordersByDate = new Map<string, typeof sortedHistory>()

      for (const order of sortedHistory) {
        const orderTimestamp = order.filledAt || order.createdAt
        const dateStr = toDateString(orderTimestamp)

        if (!ordersByDate.has(dateStr)) {
          ordersByDate.set(dateStr, [])
        }
        ordersByDate.get(dateStr)!.push(order)
      }

      // Calculate portfolio value for each unique date
      for (const [dateStr, orders] of ordersByDate) {
        for (const order of orders) {
          const price = order.price
          const amount = order.amount

          if (order.side === 'buy') {
            // Buying: decrease balance, increase holdings value
            currentValueAtPoint -= price * amount
          } else {
            // Selling: increase balance
            currentValueAtPoint += price * amount
          }

          currentValueAtPoint = Math.max(0, currentValueAtPoint)
        }

        // Store the final portfolio value for this date
        portfolioValueByDate.set(dateStr, currentValueAtPoint)
      }
    }

    // Convert the map to sorted array for lightweight-charts
    const data = Array.from(portfolioValueByDate.entries())
      .map(([time, value]) => ({ time, value }))
      .sort((a, b) => a.time.localeCompare(b.time))

    series.setData(data)
    chart.timeScale().fitContent()

    chartInstanceRef.current = chart

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove()
        chartInstanceRef.current = null
      }
    }
  }, [initialValue, currentValue, orderHistory])

  const pnl = currentValue - initialValue
  const pnlPercent = (pnl / initialValue) * 100

  return (
    <div data-testid="pnl-chart" className="bg-[#111827] rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Portfolio Performance</h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-gray-400 text-xs">Current Value</p>
              <p
                data-testid="current-value"
                className="text-2xl font-bold text-white"
              >
                ${currentValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total P&L</p>
              <p
                data-testid="total-pnl"
                className={`text-lg font-semibold ${
                  pnl >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {pnl >= 0 ? '+' : ''}
                {pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}
                {pnlPercent.toFixed(1)}%%)
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector - visual only for now */}
        <div className="flex gap-2">
          {['1W', '1M', '3M', 'ALL'].map((period) => (
            <button
              key={period}
              className="px-3 py-1 text-sm rounded-md bg-[#0a0e17] text-gray-400 hover:text-white hover:bg-[#1a2332] transition-colors"
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} data-testid="chart-container" />
    </div>
  )
}

export default SimplePnlChart
