/**
 * TDG Phase 2.3-2.4: TradingPage Timeframe Integration Tests
 *
 * Test-Driven Development Cycles:
 * - Cycle 2.3: Active Timeframe State (default to 15m)
 * - Cycle 2.4: Chart Refresh on Timeframe Change
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TradingPage from './TradingPage';
import { getDataPointCount } from '@/lib/timeframe';

// Mock the localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock lightweight-charts to avoid canvas rendering issues
vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addSeries: vi.fn(() => ({
      setData: vi.fn(),
      priceScale: vi.fn(() => ({
        applyOptions: vi.fn(),
      })),
    })),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn(),
    })),
    applyOptions: vi.fn(),
    remove: vi.fn(),
  })),
  CandlestickSeries: vi.fn(),
  HistogramSeries: vi.fn(),
}));

// Mock gsap with proper named export handling
vi.mock('gsap', async () => {
  const actual = await vi.importActual('gsap');
  return {
    ...actual,
    to: vi.fn(() => ({ kill: vi.fn() })),
  };
});

// Mock hooks
vi.mock('@/hooks/useTrading', () => ({
  useTrading: vi.fn(() => ({
    orders: [],
    portfolio: { balance: 10000, holdings: {} },
    placeOrder: vi.fn(async () => ({ success: true })),
    cancelOrder: vi.fn(),
    isPlacingOrder: false,
  })),
}));

vi.mock('@/hooks/useRealtimePrices', () => ({
  useRealtimePrices: vi.fn(() => [
    {
      symbol: 'REC/USDT',
      name: 'REC',
      price: 125.43,
      change24h: 2.34,
      high24h: 128.90,
      low24h: 122.10,
      volume24h: '1.2M',
    },
    {
      symbol: 'BTC/USDT',
      name: 'Bitcoin',
      price: 67500.00,
      change24h: 1.5,
      high24h: 68000,
      low24h: 66500,
      volume24h: '2.5B',
    },
  ]),
}));

vi.mock('@/hooks/useOrderBook', () => ({
  useOrderBook: vi.fn(() => ({
    asks: Array(12).fill(null).map((_, i) => ({
      price: 126 + (12 - i) * 0.1,
      size: Math.random() * 1000,
      total: Math.random() * 10000,
    })),
    bids: Array(12).fill(null).map((_, i) => ({
      price: 125 - i * 0.1,
      size: Math.random() * 1000,
      total: Math.random() * 10000,
    })),
  })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TradingPage Timeframe Integration (TDG Phase 2.3-2.4)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // Helper to wait for initial load to complete
  const waitForLoad = async () => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
  };

  // Helper to render and wait for load
  const renderAndWait = async (element: React.ReactElement) => {
    render(element);
    await waitForLoad();
  };

  /**
   * TDG Cycle 2.3: Active Timeframe State
   *
   * RED: Test that activeTimeframe defaults to '15m' and is highlighted
   */
  describe('Cycle 2.3: Active Timeframe State', () => {
    it('should have activeTimeframe state defaulting to 15m', async () => {
      await renderAndWait(<TradingPage isLoggedIn={false} onLoginClick={vi.fn()} />);

      // Find timeframe buttons by their text content
      const timeframeButtons = screen.getAllByRole('button').filter((button) => {
        const text = button.textContent;
        return ['1m', '5m', '15m', '1H', '4H', '1D', '1W'].includes(text || '');
      });

      // Should have all 7 timeframe buttons
      expect(timeframeButtons).toHaveLength(7);

      // Find the 15m button
      const button15m = timeframeButtons.find((b) => b.textContent === '15m');
      expect(button15m).toBeDefined();

      // Should have active styling class
      expect(button15m).toHaveClass('text-[#40ffa9]');

      // Other buttons should not have the active class
      const button1m = timeframeButtons.find((b) => b.textContent === '1m');
      const button1H = timeframeButtons.find((b) => b.textContent === '1H');

      expect(button1m).not.toHaveClass('text-[#40ffa9]');
      expect(button1H).not.toHaveClass('text-[#40ffa9]');
    });

    it('should load initial timeframe from localStorage if available', async () => {
      // Set a saved timeframe in localStorage
      localStorage.setItem('carbonx_chart_timeframe', '1H');

      await renderAndWait(<TradingPage isLoggedIn={false} onLoginClick={vi.fn()} />);

      // Find timeframe buttons
      const timeframeButtons = screen.getAllByRole('button').filter((button) => {
        const text = button.textContent;
        return ['1m', '5m', '15m', '1H', '4H', '1D', '1W'].includes(text || '');
      });

      // The 1H button should be active
      const button1H = timeframeButtons.find((b) => b.textContent === '1H');
      expect(button1H).toHaveClass('text-[#40ffa9]');

      // The 15m button should not be active
      const button15m = timeframeButtons.find((b) => b.textContent === '15m');
      expect(button15m).not.toHaveClass('text-[#40ffa9]');
    });

    it('should fallback to default when localStorage has invalid timeframe', async () => {
      // Set an invalid timeframe in localStorage
      localStorage.setItem('carbonx_chart_timeframe', 'invalid');

      await renderAndWait(<TradingPage isLoggedIn={false} onLoginClick={vi.fn()} />);

      // Should fallback to 15m default
      const timeframeButtons = screen.getAllByRole('button').filter((button) => {
        const text = button.textContent;
        return ['1m', '5m', '15m', '1H', '4H', '1D', '1W'].includes(text || '');
      });

      const button15m = timeframeButtons.find((b) => b.textContent === '15m');
      expect(button15m).toHaveClass('text-[#40ffa9]');
    });
  });

  /**
   * TDG Cycle 2.4: Chart Refresh on Timeframe Change
   *
   * RED: Test that clicking a timeframe button updates the active state
   * and triggers chart data refresh
   */
  describe('Cycle 2.4: Chart Refresh on Timeframe Change', () => {
    it('should update active timeframe when a button is clicked', async () => {
      await renderAndWait(<TradingPage isLoggedIn={false} onLoginClick={vi.fn()} />);

      // Find timeframe buttons
      const timeframeButtons = screen.getAllByRole('button').filter((button) => {
        const text = button.textContent;
        return ['1m', '5m', '15m', '1H', '4H', '1D', '1W'].includes(text || '');
      });

      // Initially 15m should be active
      const button15m = timeframeButtons.find((b) => b.textContent === '15m');
      const button1H = timeframeButtons.find((b) => b.textContent === '1H');

      expect(button15m).toHaveClass('text-[#40ffa9]');
      expect(button1H).not.toHaveClass('text-[#40ffa9]');

      // Click 1H button - wrap in act since it causes state updates
      await act(async () => {
        fireEvent.click(button1H!);
        // Advance timers to handle any useEffect callbacks
        await vi.advanceTimersByTimeAsync(50);
      });

      // Now 1H should be active, 15m should not
      expect(button1H).toHaveClass('text-[#40ffa9]');
      expect(button15m).not.toHaveClass('text-[#40ffa9]');
    });

    it('should save selected timeframe to localStorage when changed', async () => {
      await renderAndWait(<TradingPage isLoggedIn={false} onLoginClick={vi.fn()} />);

      // Find timeframe buttons
      const timeframeButtons = screen.getAllByRole('button').filter((button) => {
        const text = button.textContent;
        return ['1m', '5m', '15m', '1H', '4H', '1D', '1W'].includes(text || '');
      });

      // Click 4H button
      const button4H = timeframeButtons.find((b) => b.textContent === '4H');
      await act(async () => {
        fireEvent.click(button4H!);
        await vi.advanceTimersByTimeAsync(50);
      });

      // Check localStorage was updated
      expect(localStorage.getItem('carbonx_chart_timeframe')).toBe('4H');
    });

    it('should change timeframe when clicking through multiple buttons', async () => {
      await renderAndWait(<TradingPage isLoggedIn={false} onLoginClick={vi.fn()} />);

      // Find timeframe buttons
      const timeframeButtons = screen.getAllByRole('button').filter((button) => {
        const text = button.textContent;
        return ['1m', '5m', '15m', '1H', '4H', '1D', '1W'].includes(text || '');
      });

      // Helper to get active button
      const getActiveButton = () => {
        return timeframeButtons.find((b) => b.className.includes('text-[#40ffa9]'));
      };

      // Initially 15m should be active
      expect(getActiveButton()?.textContent).toBe('15m');

      // Click 1m
      await act(async () => {
        fireEvent.click(timeframeButtons.find((b) => b.textContent === '1m')!);
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(getActiveButton()?.textContent).toBe('1m');

      // Click 1D
      await act(async () => {
        fireEvent.click(timeframeButtons.find((b) => b.textContent === '1D')!);
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(getActiveButton()?.textContent).toBe('1D');

      // Click 5m
      await act(async () => {
        fireEvent.click(timeframeButtons.find((b) => b.textContent === '5m')!);
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(getActiveButton()?.textContent).toBe('5m');
    });
  });

  /**
   * Integration Tests: Verify useChartData hook integration
   */
  describe('Integration: useChartData Hook', () => {
    it('should use correct data point count based on timeframe', () => {
      // Verify the getDataPointCount utility function
      const points1m = getDataPointCount('1m');
      const points5m = getDataPointCount('5m');
      const points15m = getDataPointCount('15m');
      const points1H = getDataPointCount('1H');

      // 1m should have the most points (100 minutes / 1 minute = 100)
      expect(points1m).toBe(100);

      // 5m should have fewer points (100 minutes / 5 minutes = 20)
      expect(points5m).toBe(20);

      // 15m should have even fewer (100 minutes / 15 minutes = 6)
      expect(points15m).toBe(6);

      // 1H should have the fewest (100 minutes / 60 minutes = 1)
      expect(points1H).toBe(1);
    });
  });
});
