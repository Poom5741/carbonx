import React from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts'

export interface PnlDataPoint {
  date: string
  value: number
  pnl: number
}

interface PnlChartProps {
  data: PnlDataPoint[]
}

export const PnlChart: React.FC<PnlChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div data-testid="pnl-chart" className="bg-[#111827] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Portfolio Performance</h2>
        <p data-testid="no-data-message" className="text-gray-400">No historical data available</p>
      </div>
    )
  }

  const latestData = data[data.length - 1]
  const initialValue = data[0]?.value ?? 0
  const totalPnl = latestData.pnl

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#1a2332] border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-sm">{formatDate(data.date)}</p>
          <p className="text-white font-semibold">Value: ${data.value.toLocaleString()}</p>
          <p className={`${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'} text-sm`}>
            P&L: {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(2)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div data-testid="pnl-chart" className="bg-[#111827] rounded-xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Portfolio Performance</h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-gray-400 text-xs">Current Value</p>
              <p data-testid="current-value" className="text-2xl font-bold text-white">
                ${latestData.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total P&L</p>
              <p
                data-testid="total-pnl"
                className={`text-lg font-semibold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {['1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
            <button
              key={period}
              className="px-3 py-1 text-sm rounded-md bg-[#0a0e17] text-gray-400 hover:text-white hover:bg-[#1a2332] transition-colors"
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={totalPnl >= 0 ? '#40ffa9' : '#f87171'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={totalPnl >= 0 ? '#40ffa9' : '#f87171'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              domain={['dataMin - 500', 'dataMax + 500']}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={initialValue} stroke="#6b7280" strokeDasharray="2 2" strokeOpacity={0.5} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={totalPnl >= 0 ? '#40ffa9' : '#f87171'}
              strokeWidth={2}
              fill="url(#pnlGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
