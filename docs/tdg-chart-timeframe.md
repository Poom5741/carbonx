# TDG Plan: Chart Timeframe Feature

**Project**: Blockedge Exchange - CarbonX Frontend
**Path**: `/Users/poom-work/tokenine/blockedge-exchange/frontend`
**Created**: 2026-02-15
**Methodology**: Test-Driven Generation (TDG) - Red-Green-Refactor cycles

---

## Overview

This plan breaks down the chart timeframe feature into test-first implementation steps. Each agent will follow TDG methodology: write failing tests first, implement to pass tests, then refactor.

**Key Files**:
- `src/pages/TradingPage.tsx` - Main trading page with chart
- `src/hooks/useRealtimePrices.ts` - Real-time price updates
- `src/hooks/useOrderBook.ts` - Order book data

---

## Phase 1: Chart Data Stability

### Agent 1: Chart Data Generator Hook

**Test File**: `src/hooks/useChartData.test.ts`
**Implementation File**: `src/hooks/useChartData.ts`

#### TDG Cycle 1.1: Hook Interface
**RED (Write failing test)**:
```typescript
describe('useChartData', () => {
  it('should return initial data structure with candle and volume data', () => {
    const { result } = renderHook(() => useChartData(100))
    expect(result.current).toHaveProperty('candleData')
    expect(result.current).toHaveProperty('volumeData')
    expect(Array.isArray(result.current.candleData)).toBe(true)
    expect(Array.isArray(result.current.volumeData)).toBe(true)
  })
})
```

**GREEN (Implement minimum to pass)**:
```typescript
export function useChartData(dataPointCount: number) {
  return { candleData: [], volumeData: [] }
}
```

**REFACTOR**: N/A (initial structure)

#### TDG Cycle 1.2: Price Continuity
**RED (Write failing test)**:
```typescript
it('should maintain price continuity between updates', () => {
  const { result, rerender } = renderHook(({ count }) => useChartData(count), { initialProps: { count: 50 } })
  const firstDataLast = result.current.candleData[result.current.candleData.length - 1]

  rerender({ count: 100 })
  const secondDataFirst = result.current.candleData[0]

  // First data point should connect to last data point
  expect(Math.abs(secondDataFirst.open - firstDataLast.close)).toBeLessThan(0.01)
})
```

**GREEN**: Add ref to store last price

**REFACTOR**: Extract price continuity logic to helper function

#### TDG Cycle 1.3: Reduced Volatility
**RED (Write failing test)**:
```typescript
it('should have realistic price movement (max 5% change per candle)', () => {
  const { result } = renderHook(() => useChartData(100))
  const basePrice = 100

  result.current.candleData.forEach((candle, i) => {
    const change = Math.abs(candle.close - candle.open) / basePrice
    expect(change).toBeLessThan(0.05)
  })
})
```

**GREEN**: Implement reduced volatility algorithm

**REFACTOR**: Make volatility percentage configurable

#### TDG Cycle 1.4: Timeframe Parameter
**RED (Write failing test)**:
```typescript
it('should generate different data for different timeframes', () => {
  const { result: result1m } = renderHook(() => useChartData(50, '1m'))
  const { result: result1h } = renderHook(() => useChartData(50, '1h'))

  // 1h should have wider time spacing
  const timeDiff1m = result1m.current.candleData[1].time - result1m.current.candleData[0].time
  const timeDiff1h = result1h.current.candleData[1].time - result1h.current.candleData[0].time
  expect(timeDiff1h).toBeGreaterThan(timeDiff1m)
})
```

**GREEN**: Add timeframe parameter

**REFACTOR**: Create timeframe config object

---

## Phase 2: Timeframe State Management

### Agent 2: Timeframe Configuration & State

**Test File**: `src/lib/timeframe.test.ts`
**Implementation File**: `src/lib/timeframe.ts`

#### TDG Cycle 2.1: Timeframe Config
**RED (Write failing test)**:
```typescript
describe('timeframe config', () => {
  it('should have all required timeframes with correct intervals', () => {
    const config = getTimeframeConfig()

    expect(config).toHaveProperty('1m')
    expect(config).toHaveProperty('5m')
    expect(config).toHaveProperty('15m')
    expect(config).toHaveProperty('1H')
    expect(config).toHaveProperty('4H')
    expect(config).toHaveProperty('1D')
    expect(config).toHaveProperty('1W')

    expect(config['1m'].intervalMinutes).toBe(1)
    expect(config['1H'].intervalMinutes).toBe(60)
    expect(config['1D'].intervalMinutes).toBe(1440)
  })
})
```

**GREEN**: Create timeframe config

**REFACTOR**: Export type for TimeframeConfig

#### TDG Cycle 2.2: Data Point Calculation
**RED (Write failing test)**:
```typescript
it('should calculate correct number of data points for timeframe', () => {
  const points1m = getDataPointCount('1m')
  const points1h = getDataPointCount('1h')

  // 1h should have fewer points than 1m for same time range
  expect(points1h).toBeLessThan(points1m)
  expect(points1h).toBe(Math.floor(points1m / 60))
})
```

**GREEN**: Implement data point calculation

**REFACTOR**: Cache calculations

---

### Agent 3: TradingPage Timeframe Integration

**Test File**: `src/pages/TradingPage.timeframe.test.tsx`
**Implementation File**: `src/pages/TradingPage.tsx`

#### TDG Cycle 2.3: Active Timeframe State
**RED (Write failing test)**:
```typescript
it('should have activeTimeframe state defaulting to 15m', () => {
  render(<TradingPage isLoggedIn={false} onLoginClick={vi.fn()} />)
  const buttons = screen.getAllByRole('button').filter(b =>
    ['1m', '5m', '15m', '1H', '4H', '1D', '1W'].includes(b.textContent)
  )

  const activeButton = buttons.find(b => b.textContent === '15m')
  expect(activeButton).toHaveClass('text-[#40ffa9]')
})
```

**GREEN**: Add activeTimeframe state

**REFACTOR**: Extract timeframe button to component

#### TDG Cycle 2.4: Chart Refresh on Timeframe Change
**RED (Write failing test)**:
```typescript
it('should refresh chart data when timeframe changes', async () => {
  const { result } = renderHook(() => useChartData(50, '15m'))
  const initialData = result.current.candleData

  act(() => {
    rerender({ timeframe: '1H' })
  })

  expect(result.current.candleData).not.toEqual(initialData)
})
```

**GREEN**: Add useEffect for timeframe changes

**REFACTOR**: Debounce rapid timeframe changes

---

## Phase 3: Timeframe Button Integration

### Agent 4: Button Interactions & Persistence

**Test File**: `src/components/TimeframeSelector.test.tsx`
**Implementation File**: `src/components/TimeframeSelector.tsx`

#### TDG Cycle 3.1: Click Handler
**RED (Write failing test)**:
```typescript
it('should call onTimeframeChange with correct timeframe when clicked', () => {
  const handleChange = vi.fn()
  render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={handleChange} />)

  fireEvent.click(screen.getByText('1H'))
  expect(handleChange).toHaveBeenCalledWith('1H')
})
```

**GREEN**: Implement onClick handler

**REFACTOR**: Use callback ref for performance

#### TDG Cycle 3.2: Active State Styling
**RED (Write failing test)**:
```typescript
it('should apply active styles to selected timeframe', () => {
  render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={vi.fn()} />)

  const activeBtn = screen.getByText('15m')
  const inactiveBtn = screen.getByText('1H')

  expect(activeBtn).toHaveClass('text-[#40ffa9]')
  expect(inactiveBtn).not.toHaveClass('text-[#40ffa9]')
})
```

**GREEN**: Implement conditional styling

**REFACTOR**: Extract styles to object

#### TDG Cycle 3.3: Mobile Selector
**RED (Write failing test)**:
```typescript
it('should render select dropdown on mobile, buttons on desktop', () => {
  const { rerender } = render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={vi.fn()} />)

  // Desktop - buttons
  expect(screen.queryByRole('combobox')).toBeNull()

  // Mobile - select
  window.innerWidth = 500
  rerender(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={vi.fn()} />)
  expect(screen.queryByRole('combobox')).toBeInTheDocument()
})
```

**GREEN**: Add responsive component

**REFACTOR**: Use useMedia hook

#### TDG Cycle 3.4: localStorage Persistence
**RED (Write failing test)**:
```typescript
it('should save timeframe to localStorage when changed', () => {
  const handleChange = vi.fn()
  render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={handleChange} />)

  fireEvent.click(screen.getByText('1H'))

  expect(localStorage.setItem).toHaveBeenCalledWith(
    'carbonx_chart_timeframe',
    '1H'
  )
})
```

**GREEN**: Add localStorage save

**REFACTOR**: Extract to custom hook useTimeframePersistence

---

## File Structure

```
frontend/src/
├── hooks/
│   ├── useChartData.ts          # NEW - Chart data generation hook
│   ├── useChartData.test.ts     # NEW - Tests for useChartData
│   └── useTimeframePersistence.ts  # NEW - localStorage for timeframe
├── lib/
│   ├── timeframe.ts             # NEW - Timeframe configuration
│   └── timeframe.test.ts        # NEW - Tests for config
├── components/
│   ├── TimeframeSelector.tsx    # NEW - Timeframe button component
│   └── TimeframeSelector.test.tsx  # NEW - Tests for selector
└── pages/
    └── TradingPage.tsx          # MODIFY - Add timeframe integration
```

---

## Execution Order

1. **Agent 1** starts on Phase 1 (Chart Data Generator Hook)
2. **Agent 2** starts on Phase 2.1-2.2 (Timeframe Config) - independent of Agent 1
3. **Agent 3** starts on Phase 2.3-2.4 (TradingPage Integration) - depends on Agent 1, 2
4. **Agent 4** starts on Phase 3 (Button Integration) - depends on Agent 2

---

## Success Criteria Validation

After all agents complete, verify:

```typescript
// Final integration test
describe('Chart Timeframe Feature', () => {
  it('should show stable price movement across all timeframes', () => {
    // Test volatility on each timeframe
  })

  it('should change chart data when timeframe buttons clicked', () => {
    // Test button click updates chart
  })

  it('should highlight active timeframe visually', () => {
    // Test active state styling
  })

  it('should persist timeframe across page reloads', () => {
    // Test localStorage persistence
  })
})
```

---

## Testing Commands

```bash
# Run tests for specific agent
pnpm test src/hooks/useChartData.test.ts
pnpm test src/lib/timeframe.test.ts
pnpm test src/components/TimeframeSelector.test.tsx
pnpm test src/pages/TradingPage.timeframe.test.tsx

# Run all timeframe tests
pnpm test --testNamePattern="timeframe"

# Coverage
pnpm test --coverage --collectCoverageFrom="src/{hooks,lib,components}/**/*timeframe*"
```

---

## Notes for Agents

1. **Always follow Red-Green-Refactor**: Write failing test first, then implement
2. **Keep tests isolated**: Each test should be independent
3. **Use vi.fn() for mocks**: Vitest is the test runner
4. **Test edge cases**: Empty data, invalid timeframes, rapid clicks
5. **Refactor after green**: Clean up code only after tests pass
