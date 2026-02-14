# CarbonX Product Evolution Plan
## Goal: Presentation-Ready Sandbox

**Product Vision**: Anonymous carbon credit trading with CEX feel, DEX orderbook

---

## Phase 1: Core Experience (Must Have)
- [ ] Make order book updates feel "live" and dynamic
- [ ] Implement place/cancel order flow with visual feedback
- [ ] Show portfolio holdings update when orders execute
- [ ] Add simulated wallet connection flow (mock sequence)
- [ ] Ensure mobile responsiveness works smoothly

---

## Phase 2: Believability (Should Have)
- [ ] Create simulated price movement algorithm
- [ ] Add order fill notifications (toast messages)
- [ ] Display trade history in portfolio/orders view
- [ ] Show order status changes (pending → filled)
- [ ] Add loading states for realistic delays

---

## Phase 3: Persistence (Nice to Have)
- [ ] Save portfolio state to localStorage
- [ ] Persist order history across sessions
- [ ] Save login/wallet connection state
- [ ] Add "Reset Demo" button for fresh start
- [ ] Test state survives page refresh

---

## Phase 4: Polish (Presentation Ready)
- [ ] Add PnL chart to portfolio page
- [ ] Create onboarding tooltip tour for first-time users
- [ ] Add global stats ticker or leaderboard
- [ ] Include smooth page transitions
- [ ] Test complete user flow end-to-end

---

## Out of Scope (Production)
- Real blockchain integration
- Actual wallet connection (Web3)
- Backend API or database
- Real-time websockets
- KYC or compliance flows

---

## Definition of Done
A user can:
1. "Connect" a wallet and see their address
2. Browse markets and see prices moving
3. Place an order and see it fill
4. Check portfolio and see updated balance
5. Close browser, return, and see their "trades"
