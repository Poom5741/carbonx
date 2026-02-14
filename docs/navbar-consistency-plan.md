# Navbar Consistency Plan

## Goal
Unify navbar implementation across all pages for consistent UX and maintainability.

---

## Phase 1: Audit & Design
- [ ] Document current navbar variations (Landing, Trading, Markets, Portfolio)
- [ ] Define shared navbar states (transparent vs solid background)
- [ ] Define navigation links structure for all pages
- [ ] Identify which pages need scroll-aware styling
- [ ] Confirm mobile menu behavior requirements

---

## Phase 2: Refactor Shared Navbar
- [ ] Add mode prop to Navbar component (landing vs app mode)
- [ ] Implement scroll-aware background change
- [ ] Ensure active route highlighting works everywhere
- [ ] Add responsive breakpoint handling
- [ ] Test all navbar states (logged in/out, mobile/desktop)

---

## Phase 3: Update Pages to Use Shared Navbar
- [ ] Remove inline navbar from LandingPage
- [ ] Remove inline navbar from TradingPage
- [ ] Add proper navbar to MarketsPage
- [ ] Ensure PortfolioPage keeps using shared Navbar
- [ ] Update App.tsx layout wrapper if needed

---

## Phase 4: Test & Verify
- [ ] Visual check of navbar on all routes
- [ ] Test mobile menu open/close on each page
- [ ] Test login state changes persist across navigation
- [ ] Verify scroll effects work on landing page
- [ ] Check active link highlighting behavior

---

## Out of Scope (Future)
- Navbar state persistence to localStorage
- Advanced navbar animations
- Navbar customization per page type
