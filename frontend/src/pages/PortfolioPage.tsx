import React from 'react'
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader'
import { SummaryCard } from '@/components/portfolio/SummaryCard'
import { HoldingsTable } from '@/components/portfolio/HoldingsTable'
import { formatCurrency, formatPercentage } from '@/utils/formatters'
import { ResponsiveGrid } from '@/utils/responsive'

interface PortfolioPageProps {
  isLoggedIn: boolean
  onLoginClick: () => void
}

interface HoldingData {
  symbol: string
  name: string
  amount: number
  currentPrice: number
  change24h: number
}

const holdingsData: HoldingData[] = [
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

const holdings = holdingsData.map(holding => ({
  symbol: holding.symbol,
  name: holding.name,
  amount: holding.amount,
  value: formatCurrency(holding.amount * holding.currentPrice),
  change24h: formatPercentage(holding.change24h),
  changeType: holding.change24h >= 0 ? 'positive' as const : 'negative' as const
}))

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ isLoggedIn, onLoginClick }) => {
  return (
    <div data-testid="portfolio-page" className="min-h-screen bg-[#0a0e17]">
      <PortfolioHeader isLoggedIn={isLoggedIn} onLoginClick={onLoginClick} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Portfolio <span className="text-[#40ffa9]">Overview</span>
        </h1>

        <div className={`grid ${ResponsiveGrid.summaryCards} gap-4 mb-8`}>
          <SummaryCard
            testId="total-balance-card"
            label="Total Balance"
            value="$12,450.00"
          />
          <SummaryCard
            testId="total-assets-card"
            label="Total Assets"
            value="6"
          />
          <SummaryCard
            testId="daily-pnl-card"
            label="24h P&L"
            value="+2.4%"
            valueClassName="text-green-400"
          />
          <SummaryCard
            testId="pending-orders-card"
            label="Pending Orders"
            value="3"
          />
        </div>

        <div data-testid="holdings-section" className="bg-[#111827] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Holdings</h2>
          <HoldingsTable holdings={holdings} />
        </div>

        <div data-testid="open-orders-section" className="bg-[#111827] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Open Orders</h2>
          <p className="text-gray-400">No open orders</p>
        </div>
      </main>
    </div>
  )
}
