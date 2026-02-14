/**
 * Responsive Design Utilities
 *
 * This file documents the responsive breakpoint patterns used throughout the application.
 * These are based on Tailwind CSS default breakpoints:
 *
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */

/**
 * Common responsive grid patterns used in the app
 */
export const ResponsiveGrid = {
  /**
   * Summary cards grid: 1 column on mobile, 2 on tablet, 4 on desktop
   * Used in: PortfolioPage summary cards
   */
  summaryCards: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',

  /**
   * Markets grid: 2 columns on mobile, 4 on desktop
   * Used in: MarketsPage market cards
   */
  marketsGrid: 'grid-cols-2 lg:grid-cols-4',

  /**
   * Features grid: 2 columns on mobile, 4 on desktop
   * Used in: LandingPage features section
   */
  featuresGrid: 'grid-cols-2 lg:grid-cols-4',

  /**
   * Stats grid: 2 columns on tablet, 4 on desktop
   * Used in: LandingPage stats section
   */
  statsGrid: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

/**
 * Common navigation patterns
 */
export const NavigationClasses = {
  /**
   * Desktop navigation: hidden on mobile, flex on tablet and up
   */
  desktopNav: 'hidden md:flex',

  /**
   * Mobile menu: flex on mobile, hidden on tablet and up
   */
  mobileMenu: 'md:hidden',
} as const
