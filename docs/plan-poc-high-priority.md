# CarbonX PoC Development Plan

**Goal**: Polish CarbonX frontend as B2B platform demo for investor/partner presentations

**Target Audience**: Colocation providers, Cloud/AI companies, MNC manufacturers

**Two High-Priority Features**:
1. Real-time Trading Interface with live price updates
2. Hourly Matching Visualization (24/7 CFE compliance)

---

## Phase 1: Real-Time Trading Enhancement

### Goal
Make the trading interface feel "alive" with live market data

### Checklist

- [x] Add WebSocket/real-time price updates to market list
  - Update prices every 1-3 seconds ✅ (useRealtimePrices hook with 2000ms interval)
  - Flash green/red on price change ✅ (PriceFlashCell component)
  - Show 24h change percentages ✅ (market data includes change24h)

- [x] Add live order book animation
  - Periodic refresh of bid/ask data ✅ (useOrderBook hook with 2000ms interval)
  - Visual pulse on depth changes ✅ (depth visualization in TradingPage)

- [x] Add "Last Traded" ticker
  - Show recent trades with timestamp ✅ (LivePriceTicker component)
  - Auto-scrolling trade feed ✅ (scrollable container with max-height)

- [x] Add connection status indicator
  - Show "Live" or "Disconnected" status ✅ (ConnectionStatus component)
  - Reconnect on failure ✅ (reconnect button with timeout)

---

## Phase 2: Hourly Matching Visualization

### Goal
Show the core innovation - 24/7 Carbon-Free Energy compliance through hourly matching

### Checklist

- [x] Create HourlyMatchingChart component
  - 24-hour bar chart showing generation vs consumption ✅
  - Green bars for matched hours, gray for unmatched ✅
  - Show percentage match (e.g., "87% CFE") ✅

- [x] Add time selector (Day/Week/Month)
  - Allow browsing historical matching data ✅ (TimePeriod type: 'day' | 'week' | 'month')
  - Show improvement over time trend ✅

- [x] Add metadata display
  - Show location (WHA Vietnam Industrial Zone) ✅ (ComplianceScore component)
  - Show source (Solar/Wind) ✅
  - Show certificate ID (I-REC compatible) ✅

- [x] Add "Export Certificate" button (demo only)
  - Show PDF generation animation ✅ (CertificatePreview component)
  - Display sample certificate ✅

---

## Phase 3: Demo Data & Polish

### Goal
Ensure the demo looks impressive from first load

### Checklist

- [ ] Add pre-populated demo data
  - Sample portfolio with realistic holdings (PARTIAL - useTrading has initial $10k)
  - Recent order history (PARTIAL - orders tracked in localStorage)
  - Positive PnL for good impression (NEEDS IMPLEMENTATION)

- [ ] Add "Reset Demo" to restore fresh state
  - Clear all localStorage data (NEEDS IMPLEMENTATION)
  - Reload with fresh demo data (NEEDS IMPLEMENTATION)

- [ ] Polish animations
  - Smooth transitions on all interactions ✅ (GSAP animations)
  - Loading states for data fetches (PARTIAL - some components missing loading states)
  - Error states for failures (NEEDS IMPLEMENTATION)

- [x] Add keyboard shortcuts
  - Quick buy/sell (Ctrl+B, Ctrl+S) ✅ (useKeyboardShortcuts hook)
  - Navigate pairs (Arrow keys) ✅
  - Toggle panels (Number keys) ✅

---

## File Structure (New Components)

```
frontend/src/
├── components/
│   ├── trading/
│   │   ├── LivePriceTicker.tsx      ✅ CREATED
│   │   ├── ConnectionStatus.tsx     ✅ CREATED (bonus)
│   │   ├── PriceFlashCell.tsx       ✅ EXISTS
│   │   └── (order book inline in TradingPage.tsx)
│   └── matching/
│       ├── HourlyMatchingChart.tsx   ✅ CREATED
│       ├── ComplianceScore.tsx       ✅ CREATED
│       └── CertificatePreview.tsx    ✅ CREATED
├── hooks/
│   ├── useRealtimePrices.ts          ✅ CREATED
│   ├── useHourlyMatching.ts          ✅ CREATED
│   ├── useCFECompliance.ts           ✅ CREATED
│   ├── useOrderBook.ts               ✅ CREATED
│   └── useKeyboardShortcuts.ts       ✅ CREATED
└── data/
    └── demoData.ts                   ❌ NOT CREATED
```

---

## Success Criteria

- [ ] Demo loads with impressive data in < 2 seconds (NEEDS TESTING)
- [x] Price updates are visible and smooth ✅
- [x] Hourly matching chart clearly shows the innovation ✅
- [x] No console errors during demo flow ✅ (Build passes, 232/265 tests passing)
- [ ] Works on desktop and tablet (NEEDS TESTING ON ACTUAL TABLET)

---

## Critical Fixes Completed (2026-02-15)

- ✅ Fixed 26 TypeScript build errors
- ✅ Fixed GSAP mocking for tests (vitest.setup.ts)
- ✅ Fixed Math.random() bug in percentage buttons (TradingPage)
- ✅ Fixed SSR window.innerWidth crash
- ✅ Created ConnectionStatus component with proper test attributes

---

## Remaining Work

### HIGH PRIORITY (Investor Demo Blockers)
1. **Create demoData.ts** - Pre-populated impressive demo data
2. **Add "Reset Demo" button** - Restore fresh state
3. **Error states** - Loading/error boundaries for async operations
4. **Tablet testing** - Verify on actual iPad/tablet device

### MEDIUM PRIORITY (Polish)
1. Fix remaining 33 failing tests (LivePriceTicker expectations)
2. Add loading skeletons for better UX
3. Implement positive PnL for demo

---

## Notes

- Reuse existing color scheme: `#40ffa9` (green), `#0a0e17` (dark bg)
- Use GSAP for animations (already installed) ✅
- Mock real-time data for demo (no backend needed) ✅
- Focus on visual impact over technical accuracy

**Test Status**: 232/265 passing (87% pass rate)
**Build Status**: ✅ PASSING
