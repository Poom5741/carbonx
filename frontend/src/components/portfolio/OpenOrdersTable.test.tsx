import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OpenOrdersTable } from './OpenOrdersTable'

describe('OpenOrdersTable', () => {
  const mockOrders = [
    {
      id: '1',
      symbol: 'BTC/USDT',
      type: 'limit',
      side: 'buy',
      price: '42,000.00',
      amount: '0.5',
      filled: '0.2',
      total: '21,000.00',
      status: 'partially-filled',
    },
    {
      id: '2',
      symbol: 'ETH/USDT',
      type: 'market',
      side: 'sell',
      price: '1,750.00',
      amount: '5',
      filled: '5',
      total: '8,750.00',
      status: 'filled',
    },
  ]

  it('renders the open orders table', () => {
    render(<OpenOrdersTable orders={mockOrders} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('displays all column headers', () => {
    render(<OpenOrdersTable orders={mockOrders} />)

    expect(screen.getByText('Pair')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Filled')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays orders data', () => {
    render(<OpenOrdersTable orders={mockOrders} />)

    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
    expect(screen.getByText('42,000.00')).toBeInTheDocument()
    expect(screen.getByText('0.5')).toBeInTheDocument()
  })

  it('displays empty state when no orders', () => {
    render(<OpenOrdersTable orders={[]} />)

    expect(screen.getByText(/No open orders/)).toBeInTheDocument()
  })

  it('displays empty state message', () => {
    render(<OpenOrdersTable orders={[]} />)

    expect(screen.getByText('No open orders')).toBeInTheDocument()
    expect(screen.getByText("You don't have any open orders at the moment.")).toBeInTheDocument()
  })

  it('displays cancel button for each order', () => {
    render(<OpenOrdersTable orders={mockOrders} />)

    const cancelButtons = screen.getAllByText('Cancel')
    expect(cancelButtons).toHaveLength(2)
  })

  it('calls onCancel callback when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<OpenOrdersTable orders={mockOrders} onCancel={onCancel} />)

    const cancelButtons = screen.getAllByText('Cancel')
    cancelButtons[0].click()

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onCancel).toHaveBeenCalledWith('1')
  })
})
