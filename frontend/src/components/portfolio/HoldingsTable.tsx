import React from 'react'

interface Holding {
  symbol: string
  name: string
  amount: number
  value: string
  change24h: string
  changeType: 'positive' | 'negative'
}

interface HoldingsTableProps {
  holdings: Holding[]
  onTrade?: (symbol: string) => void
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onTrade }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-400 py-3 px-4">Asset</th>
            <th className="text-left text-gray-400 py-3 px-4">Amount</th>
            <th className="text-left text-gray-400 py-3 px-4">Value (USDT)</th>
            <th className="text-left text-gray-400 py-3 px-4">24h Change</th>
            <th className="text-left text-gray-400 py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.symbol} className="border-b border-gray-800">
              <td className="py-4 px-4">
                <div>
                  <p className="text-white font-medium">{holding.symbol}</p>
                  <p className="text-gray-400 text-sm">{holding.name}</p>
                </div>
              </td>
              <td className="py-4 px-4 text-white">{holding.amount}</td>
              <td className="py-4 px-4 text-white">{holding.value}</td>
              <td
                className={`py-4 px-4 ${
                  holding.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {holding.change24h}
              </td>
              <td className="py-4 px-4">
                <button
                  className="text-[#40ffa9] hover:underline"
                  onClick={() => onTrade?.(holding.symbol)}
                >
                  Trade
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
