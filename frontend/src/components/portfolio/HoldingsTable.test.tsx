import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HoldingsTable } from './HoldingsTable'

describe('HoldingsTable', () => {
  const mockHoldings = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0.5,
      value: '21,500.00',
      change24h: '+2.5%',
      changeType: 'positive' as const,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 5,
      value: '8,750.00',
      change24h: '-1.2%',
      changeType: 'negative' as const,
    },
  ]

  it('renders the holdings table', () => {
    render(<HoldingsTable holdings={mockHoldings} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('displays all column headers', () => {
    render(<HoldingsTable holdings={mockHoldings} />)

    expect(screen.getByText('Asset')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Value (USDT)')).toBeInTheDocument()
    expect(screen.getByText('24h Change')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays holdings data with symbol and name', () => {
    render(<HoldingsTable holdings={mockHoldings} />)

    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('displays amount and value', () => {
    render(<HoldingsTable holdings={mockHoldings} />)

    expect(screen.getByText('0.5')).toBeInTheDocument()
    expect(screen.getByText('21,500.00')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('8,750.00')).toBeInTheDocument()
  })

  it('displays positive changes in green', () => {
    const { container } = render(<HoldingsTable holdings={mockHoldings} />)

    const greenElement = screen.getByText('+2.5%')
    expect(greenElement).toBeInTheDocument()
    expect(greenElement).toHaveClass('text-green-400')
  })

  it('displays negative changes in red', () => {
    const { container } = render(<HoldingsTable holdings={mockHoldings} />)

    const redElement = screen.getByText('-1.2%')
    expect(redElement).toBeInTheDocument()
    expect(redElement).toHaveClass('text-red-400')
  })

  it('displays trade button for each holding', () => {
    render(<HoldingsTable holdings={mockHoldings} />)

    const tradeButtons = screen.getAllByText('Trade')
    expect(tradeButtons).toHaveLength(2)
  })

  it('calls onTrade callback when trade button is clicked', () => {
    const onTrade = vi.fn()
    render(<HoldingsTable holdings={mockHoldings} onTrade={onTrade} />)

    const tradeButtons = screen.getAllByText('Trade')
    tradeButtons[0].click()

    expect(onTrade).toHaveBeenCalledTimes(1)
    expect(onTrade).toHaveBeenCalledWith('BTC')
  })
})
