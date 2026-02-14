import React from 'react'

interface PortfolioPageProps {
  isLoggedIn: boolean
  onLoginClick: () => void
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ isLoggedIn: _isLoggedIn, onLoginClick: _onLoginClick }) => {
  const holdings = [
    {
      symbol: 'REC',
      name: 'Renewable Energy Certificate',
      amount: 150,
      currentPrice: 46.80,
      change24h: 2.4
    },
    {
      symbol: 'TVER',
      name: 'Thailand Voluntary Emission',
      amount: 500,
      currentPrice: 12.80,
      change24h: 5.1
    },
    {
      symbol: 'CER',
      name: 'Certified Emission Reduction',
      amount: 1000,
      currentPrice: 8.35,
      change24h: -1.2
    }
  ]

  const openOrders: any[] = []

  return (
    <div data-testid="portfolio-page" className="min-h-screen bg-[#0a0e17]">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-white mb-8">
          Portfolio <span className="text-[#40ffa9]">Overview</span>
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div data-testid="total-balance-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <p className="text-2xl font-bold text-white mt-2">$12,450.00</p>
          </div>
          <div data-testid="total-assets-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Assets</p>
            <p className="text-2xl font-bold text-white mt-2">6</p>
          </div>
          <div data-testid="daily-pnl-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">24h P&L</p>
            <p className="text-2xl font-bold text-green-400 mt-2">+2.4%</p>
          </div>
          <div data-testid="pending-orders-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Pending Orders</p>
            <p className="text-2xl font-bold text-white mt-2">3</p>
          </div>
        </div>

        {/* Holdings Section */}
        <div data-testid="holdings-section" className="bg-[#111827] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Holdings</h2>
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
                    <td className="py-4 px-4 text-white">
                      {'$' + (holding.amount * holding.currentPrice).toFixed(2)}
                    </td>
                    <td className={`py-4 px-4 ${holding.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-[#40ffa9] hover:underline">Trade</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Orders Section */}
        <div data-testid="open-orders-section" className="bg-[#111827] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Open Orders</h2>
          {openOrders.length === 0 ? (
            <p className="text-gray-400">No open orders</p>
          ) : (
            <table data-testid="orders-table" className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 py-3 px-4">Pair</th>
                  <th className="text-left text-gray-400 py-3 px-4">Type</th>
                  <th className="text-left text-gray-400 py-3 px-4">Side</th>
                  <th className="text-left text-gray-400 py-3 px-4">Price</th>
                  <th className="text-left text-gray-400 py-3 px-4">Amount</th>
                  <th className="text-left text-gray-400 py-3 px-4">Filled</th>
                  <th className="text-left text-gray-400 py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800">
                    <td className="py-4 px-4 text-white">{order.pair}</td>
                    <td className="py-4 px-4 text-white">{order.type}</td>
                    <td className={`py-4 px-4 ${order.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order.side}
                    </td>
                    <td className="py-4 px-4 text-white">${order.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-white">{order.amount}</td>
                    <td className="py-4 px-4 text-white">{order.filled}%</td>
                    <td className="py-4 px-4">
                      <button className="text-red-400 hover:underline">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
