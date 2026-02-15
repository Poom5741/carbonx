# TDG Implementation Plan - CarbonX Demo Polish

**Team**: CarbonX Final Polish
**Date**: 2026-02-15
**Methodology**: Test-Driven Generation (RED → GREEN → REFACTOR)

---

## Overview

This document provides detailed TDG instructions for each agent on the CarbonX team. Each task follows the TDG cycle:
1. 🔴 **RED** - Write failing tests first
2. 🟢 **GREEN** - Implement minimal code to pass tests
3. ♻️ **REFACTOR** - Clean up and optimize

---

## Agent Assignments

### 1. Logic Agent (Frontend Logic)

#### Task #1: localStorage Error Handling

**Priority**: CRITICAL (Demo blocker)

**RED Phase - Write These Tests First:**

```typescript
// localStorage.test.ts
describe('localStorage with QuotaExceededError', () => {
  it('should gracefully handle QuotaExceededError', () => {
    // Mock localStorage to throw QuotaExceededError
    // Verify fallback to in-memory state
    // Verify no crash occurs
  })

  it('should log warning when localStorage unavailable', () => {
    // Mock typeof localStorage === 'undefined'
    // Verify console.warn called
    // Verify app still works
  })

  it('should recover from corrupted data', () => {
    // Set corrupted JSON in localStorage
    // Verify graceful recovery to defaults
  })
})
```

**GREEN Phase - Implement:**

Files to modify:
- `useTrading.ts` - Wrap all `localStorage.setItem()` in try-catch
- `useHourlyMatching.ts` - Wrap in try-catch
- `useCFECompliance.ts` - Wrap in try-catch

Pattern:
```typescript
try {
  localStorage.setItem(key, JSON.stringify(value))
} catch (error) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    console.warn('localStorage full, using in-memory fallback')
    // Use in-memory fallback
  }
}
```

**REFACTOR Phase:**
- Extract common storage wrapper function
- Add recovery mechanism for corrupted data

---

#### Task #2: Reset Button Debouncing

**Priority**: CRITICAL (Visual glitch risk)

**RED Phase - Write These Tests First:**

```typescript
// useResetDemo.test.ts additions
describe('Debouncing behavior', () => {
  it('should prevent rapid double-clicks', async () => {
    const { result } = renderHook(() => useResetDemo())

    // Call reset twice rapidly
    act(() => {
      result.current.resetDemo()
      result.current.resetDemo()
    })

    // Verify only one reset occurs
    await waitFor(() => {
      expect(mockClearStorage).toHaveBeenCalledTimes(1)
    })
  })

  it('should be disabled during reset operation', async () => {
    const { result } = renderHook(() => useResetDemo())

    act(() => {
      result.current.resetDemo()
    })

    expect(result.current.isResetting).toBe(true)
    // Verify reset cannot be called again
  })
})
```

**GREEN Phase - Implement:**

Add debounce logic to `useResetDemo.ts`:
```typescript
import { useState, useCallback, useRef } from 'react'

export function useResetDemo() {
  const [isResetting, setIsResetting] = useState(false)
  const resetTimeoutRef = useRef<NodeJS.Timeout>()

  const resetDemo = useCallback(async () => {
    // Prevent rapid clicks
    if (isResetting) return

    setIsResetting(true)
    // ... reset logic with timeout
  }, [isResetting])
}
```

**REFACTOR Phase:**
- Extract debounce utility if needed elsewhere
- Add loading state prop to button component

---

### 2. Design Agent (Frontend UI)

#### Task #3: Initial Load Skeleton Integration

**Priority**: HIGH (First impression)

**RED Phase - Write These Tests First:**

```typescript
// PortfolioPage.test.tsx
describe('Initial Load Skeleton', () => {
  it('should show skeleton before data loads', () => {
    render(<PortfolioPage loading={true} />)

    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    expect(screen.getByTestId('chart-skeleton-area')).toBeInTheDocument()
  })

  it('should hide skeleton after data loads', async () => {
    render(<PortfolioPage loading={false} data={mockData} />)

    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
    })
  })
})
```

**GREEN Phase - Implement:**

Files to modify:
- `PortfolioPage.tsx` - Add loading state, show skeleton on mount
- `TradingPage.tsx` - Add loading state for chart
- `HourlyMatchingChart.tsx` - Integrate `<LoadingState type="chart" />`

Pattern:
```typescript
const [isInitialLoad, setIsInitialLoad] = useState(true)
const [data, setData] = useState(null)

useEffect(() => {
  // Load data
  loadData().then(() => setIsInitialLoad(false))
}, [])

if (isInitialLoad) {
  return <LoadingState type="chart" />
}
```

**REFACTOR Phase:**
- Create unified loading wrapper
- Add fade-in transition when data loads

---

#### Task #4: Tablet 768px Support

**Priority**: HIGH (iPad portrait mode)

**RED Phase - Write These Tests First:**

```typescript
// TradingPage.test.tsx
describe('Tablet Portrait Mode (768px)', () => {
  beforeEach(() => {
    // Set viewport to 768px
    window.innerWidth = 768
    // Trigger resize event
  })

  it('should not have horizontal scroll at 768px', () => {
    render(<TradingPage />)

    const container = screen.getByTestId('trading-page')
    expect(container.style.overflowX).toBe('hidden')
  })

  it('should stack elements vertically at 768px', () => {
    render(<TradingPage />)

    // Verify flex direction changes to column
  })
})
```

**GREEN Phase - Implement:**

Add to `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    screens: {
      'tablet-portrait': '768px',
    }
  }
}
```

Add CSS to components:
```css
@media (max-width: 768px) {
  .trading-layout {
    flex-direction: column;
  }

  .chart-container {
    height: 300px;
  }
}
```

**REFACTOR Phase:**
- Test on actual iPad if available
- Adjust touch targets to minimum 44x44px

---

### 3. Devil Agent (QA & Logic Check)

#### Task #5: Integration Testing

**Priority**: HIGH (Demo readiness)

**Test Scenarios:**

1. **Full Demo Flow Walkthrough:**
   - Clear localStorage
   - Load fresh demo
   - Navigate all pages
   - Click reset button
   - Verify smooth reset

2. **Edge Case Testing:**
   - Test localStorage at 99% capacity
   - Test with network throttled (3G)
   - Test rapid clicking on all buttons
   - Test during loading states

3. **Visual Regression:**
   - Compare before/after screenshots
   - Check animation smoothness
   - Verify color consistency

---

## Execution Order

1. **Parallel Start**: All agents begin RED phase simultaneously
2. **Phase Sync**: Wait for all RED tests written before GREEN
3. **Code Review**: Devil-agent reviews all GREEN implementations
4. **REFACTOR**: Clean up together
5. **Final QA**: Devil-agent signs off

---

## Success Criteria

- [ ] All localStorage writes wrapped in try-catch
- [ ] Reset button debounced and tested
- [ ] Initial load skeleton integrated on all pages
- [ ] Tablet 768px layout tested
- [ ] All new tests passing
- [ ] No console errors
- [ ] Demo ready for investor presentation

---

## Working Directory

`/Users/poom-work/tokenine/blockedge-exchange/frontend/src/`

---

**Remember**: TDG methodology is strict. Tests FIRST, then implementation. No exceptions!
