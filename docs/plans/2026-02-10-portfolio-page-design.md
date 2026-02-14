# Portfolio Page Design

## Overview
Create a simple Portfolio page at `/portfolio` that displays user's carbon credit holdings and assets.

## Routes
- Add route in `App.tsx`: `<Route path="/portfolio" element={<PortfolioPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginModal(true)} />} />`
- Navbar: Add Portfolio to navLinks array

## Page Structure

### Header Section
- Reuse existing header from TradingPage (same layout: logo, nav, actions)
- Nav links: Trade, Markets, Portfolio
- Show Connect button if not logged in

### Main Content

**Page Title:**
- "Portfolio" with accent color on "Overview"

**Summary Cards (4 columns):**
1. Total Balance (USDT value)
2. Total Assets (carbon credits count)
3. 24h P&L
4. Pending Orders

**Holdings Section**
- Table displaying user's carbon credit holdings
- Columns: Asset, Amount, Value (USDT), 24h Change, Actions
- Rows: REC, I-REC, TVER, CER, VCU (sample data)

**Open Orders Section**
- List of pending orders
- Columns: Pair, Type, Side, Price, Amount, Filled, Action

## Sample Data
```typescript
const portfolioData = {
  totalBalance: 12450.00,
  totalAssets: 6,
  dailyPnL: '+2.4%',
  pendingOrders: 3
};

const holdings = [
  { symbol: 'REC', name: 'Renewable Energy Certificate', amount: 150, avgPrice: 45.20, currentPrice: 46.80, change24h: 2.4 },
  { symbol: 'TVER', name: 'Thailand Voluntary Emission', amount: 500, avgPrice: 12.50, currentPrice: 12.80, change24h: 5.1 },
  { symbol: 'CER', name: 'Certified Emission Reduction', amount: 1000, avgPrice: 8.20, currentPrice: 8.35, change24h: -1.2 },
];
```

## Styling
- Use existing color scheme: bg-[#0a0e17], cards bg-[#111827], accent #40ffa9
- Match table styles from MarketsPage
- Responsive design for mobile

## Files to Create
- `frontend/src/pages/PortfolioPage.tsx` - Main component
