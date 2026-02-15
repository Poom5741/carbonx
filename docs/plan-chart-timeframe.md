# Trading Chart: Stable Price Movement & Working Timeframes

## Phase 1: Chart Data Stability
- [ ] Create reusable chart data generator hook
- [ ] Implement realistic price movement algorithm (reduce volatility)
- [ ] Store last price in ref for continuity between updates
- [ ] Add smooth transition for price updates

## Phase 2: Timeframe State Management
- [ ] Add activeTimeframe state to TradingPage
- [ ] Create timeframe configuration (intervals in minutes)
- [ ] Build timeframe-to-data mapping logic
- [ ] Add chart data refresh on timeframe change

## Phase 3: Timeframe Button Integration
- [ ] Wire onClick handlers to timeframe buttons
- [ ] Add active state styling for selected timeframe
- [ ] Implement mobile timeframe selector
- [ ] Add timeframe persistence to localStorage

## Success Criteria
- [ ] Chart shows stable price movement (no erratic jumps)
- [ ] All timeframe buttons change chart data
- [ ] Active timeframe is visually highlighted
- [ ] Timeframe selection persists across page reloads
