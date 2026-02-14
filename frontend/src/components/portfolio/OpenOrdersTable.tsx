import React from 'react'

export interface Order {
  id: string
  symbol: string
  type: string
  side: 'buy' | 'sell'
  price: string
  amount: string
  filled: string
  total: string
  status: string
}

interface OpenOrdersTableProps {
  orders: Order[]
  onCancel?: (orderId: string) => void
}

export const OpenOrdersTable: React.FC<OpenOrdersTableProps> = ({
  orders,
  onCancel,
}) => {
  // Empty state
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-2">No open orders</p>
        <p className="text-gray-500 text-sm">
          You don't have any open orders at the moment.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-400 py-3 px-4">Pair</th>
            <th className="text-left text-gray-400 py-3 px-4">Type</th>
            <th className="text-left text-gray-400 py-3 px-4">Side</th>
            <th className="text-left text-gray-400 py-3 px-4">Price</th>
            <th className="text-left text-gray-400 py-3 px-4">Amount</th>
            <th className="text-left text-gray-400 py-3 px-4">Filled</th>
            <th className="text-left text-gray-400 py-3 px-4">Total</th>
            <th className="text-left text-gray-400 py-3 px-4">Status</th>
            <th className="text-left text-gray-400 py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-800">
              <td className="py-4 px-4 text-white font-medium">
                {order.symbol}
              </td>
              <td className="py-4 px-4 text-gray-300 capitalize">
                {order.type}
              </td>
              <td
                className={`py-4 px-4 capitalize ${
                  order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {order.side}
              </td>
              <td className="py-4 px-4 text-white">{order.price}</td>
              <td className="py-4 px-4 text-white">{order.amount}</td>
              <td className="py-4 px-4 text-white">{order.filled}</td>
              <td className="py-4 px-4 text-white">{order.total}</td>
              <td className="py-4 px-4 text-gray-300 capitalize">
                {order.status}
              </td>
              <td className="py-4 px-4">
                <button
                  className="text-red-400 hover:text-red-300 hover:underline"
                  onClick={() => onCancel?.(order.id)}
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
