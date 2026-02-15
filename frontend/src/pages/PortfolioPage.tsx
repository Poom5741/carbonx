import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTrading } from '@/hooks/useTrading'
import { useResetDemo } from '@/hooks/useResetDemo'
import PnlChart from '@/components/portfolio/SimplePnlChart'
import { LoadingState } from '@/components/common/LoadingState'

interface PortfolioPageProps {
  isLoggedIn: boolean
  onLoginClick: () => void
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const {
    orders,
    portfolio,
    orderHistory,
    cancelOrder,
    getTotalValue
  } = useTrading()

  const { isResetting, resetDemo } = useResetDemo()

  // Clear initial load state after data is ready
  useEffect(() => {
    // Small delay to simulate initial load and ensure smooth transition
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId)
  }

  const handleResetClick = () => {
    setShowResetDialog(true)
  }

  const handleConfirmReset = async () => {
    setShowResetDialog(false)
    await resetDemo()
  }

  // Calculate total assets count (unique tokens)
  const totalAssets = Object.keys(portfolio.holdings).length

  // Calculate 24h Pnl
  const initialValue = 10000
  const currentValue = getTotalValue()
  const pnl = currentValue - initialValue
  const pnlPercent = (pnl / initialValue) * 100

  // Calculate total pending orders
  const pendingOrdersCount = orders.length

  // Show loading skeleton on initial mount
  if (isInitialLoad) {
    return (
      <div data-testid="portfolio-page" className="min-h-screen bg-[#0a0e17]">
        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Title skeleton */}
          <div className="h-10 w-64 bg-[#1a2234] rounded mb-8 animate-pulse" />

          {/* Chart skeleton */}
          <LoadingState type="chart" className="mb-8" />

          {/* Stats skeleton */}
          <LoadingState type="stats" className="mb-8" />

          {/* Table skeleton for holdings */}
          <div className="bg-[#111827] rounded-xl p-6 mb-8">
            <LoadingState type="table" rowCount={3} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div data-testid="portfolio-page" className="min-h-screen bg-[#0a0e17] fade-in animate-in duration-300">
      <style>{`
        @media (max-width: 768px) {
          .portfolio-grid { grid-template-columns: 1fr !important; }
          .chart-container { min-height: 300px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .table-container { overflow-x: auto !important; }
        }
      `}</style>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Portfolio <span className="text-[#40ffa9]">Overview</span>
          </h1>
          {isLoggedIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetClick}
              disabled={isResetting}
              className="border-white/20 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="reset-demo-button"
            >
              {isResetting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Resetting...
                </>
              ) : (
                'Reset Demo'
              )}
            </Button>
          )}
        </div>

        {/* Pnl Chart */}
        <div className="mb-8">
          <PnlChart
            initialValue={initialValue}
            currentValue={currentValue}
            orderHistory={orderHistory}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div data-testid="total-balance-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <p className="text-2xl font-bold text-white mt-2">
              {getTotalValue().toFixed(2)} USDT
            </p>
          </div>
          <div data-testid="total-assets-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Assets</p>
            <p className="text-2xl font-bold text-white mt-2">{totalAssets}</p>
          </div>
          <div data-testid="daily-pnl-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">24h Pnl</p>
            <p className={`text-2xl font-bold mt-2 ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
            </p>
          </div>
          <div data-testid="pending-orders-card" className="bg-[#111827] rounded-xl p-6">
            <p className="text-gray-400 text-sm">Pending Orders</p>
            <p className="text-2xl font-bold text-white mt-2">{pendingOrdersCount}</p>
          </div>
        </div>

        {/* Holdings Section */}
        <div data-testid="holdings-section" className="bg-[#111827] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Holdings</h2>
          {Object.keys(portfolio.holdings).length === 0 ? (
            <p className="text-gray-400">No holdings yet. Start trading to build your portfolio!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 py-3 px-4">Asset</th>
                    <th className="text-right text-gray-400 py-3 px-4">Amount</th>
                    <th className="text-right text-gray-400 py-3 px-4">Value (USDT)</th>
                    <th className="text-right text-gray-400 py-3 px-4">24h Change</th>
                    <th className="text-left text-gray-400 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(portfolio.holdings).map(([symbol, holding]) => (
                    <tr key={symbol} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{symbol}</p>
                          <p className="text-gray-400 text-sm">Carbon Credit</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white font-mono">{holding.amount.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right text-white font-mono">
                        {(holding.amount * holding.currentPrice).toFixed(2)}
                      </td>
                      <td className={`py-4 px-4 text-right ${holding.currentPrice >= 45 ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.currentPrice >= 45 ? '+' : ''}{((holding.currentPrice - 45) / 45 * 100).toFixed(1)}%
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => navigate('/trade')}
                          className="text-[#40ffa9] hover:underline text-sm"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Open Orders Section */}
        <div data-testid="open-orders-section" className="bg-[#111827] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Open Orders</h2>
            {orders.length > 0 && (
              <button
                onClick={() => navigate('/trade')}
                className="text-[#40ffa9] hover:underline text-sm"
              >
                + New Order
              </button>
            )}
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-400">No open orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="orders-table">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 py-3 px-4">Pair</th>
                    <th className="text-left text-gray-400 py-3 px-4">Type</th>
                    <th className="text-left text-gray-400 py-3 px-4">Side</th>
                    <th className="text-right text-gray-400 py-3 px-4">Price</th>
                    <th className="text-right text-gray-400 py-3 px-4">Amount</th>
                    <th className="text-right text-gray-400 py-3 px-4">Filled (%)</th>
                    <th className="text-right text-gray-400 py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white">{order.pair}</td>
                      <td className="py-3 px-4 text-white capitalize">{order.type}</td>
                      <td className={`py-3 px-4 ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {order.side}
                        </td>
                      <td className="py-3 px-4 text-right text-white font-mono">{order.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-white font-mono">{order.amount}</td>
                      <td className="py-3 px-4 text-right text-white font-mono">
                        {order.filled > 0 ? ((order.filled / order.amount) * 100).toFixed(0) : '0'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-400 hover:underline text-sm"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order History Section */}
        {orderHistory.length > 0 && (
          <div className="bg-[#111827] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Order History</h2>
              <div className="text-sm text-gray-400">
                {orderHistory.length} trades
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 py-3 px-4">Pair</th>
                    <th className="text-left text-gray-400 py-3 px-4">Type</th>
                    <th className="text-left text-gray-400 py-3 px-4">Side</th>
                    <th className="text-right text-gray-400 py-3 px-4">Price</th>
                    <th className="text-right text-gray-400 py-3 px-4">Amount</th>
                    <th className="text-right text-gray-400 py-3 px-4">Total</th>
                    <th className="text-left text-gray-400 py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.slice(-10).reverse().map((order) => (
                    <tr key={order.id} className="border-b border-white/5">
                      <td className="py-3 px-4 text-left text-white">{order.pair}</td>
                      <td className="py-3 px-4 text-left text-white capitalize">{order.type}</td>
                      <td className={`py-3 px-4 text-left ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {order.side}
                      </td>
                      <td className="py-3 px-4 text-right text-white font-mono">{order.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-white font-mono">{order.amount}</td>
                      <td className="py-3 px-4 text-right text-white font-mono">
                        {(order.price * order.amount).toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 text-left capitalize ${
                        order.status === 'filled' ? 'text-green-400'
                          : order.status === 'cancelled' ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}>
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-[#111827] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reset Demo Data?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will clear all your current trading data and replace it with fresh demo data.
              Your current portfolio, orders, and history will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReset}
              className="bg-[#40ffa9] text-black hover:bg-[#34cc8a] font-semibold"
            >
              Reset Demo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PortfolioPage;
