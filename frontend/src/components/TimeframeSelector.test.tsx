import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeframeSelector from './TimeframeSelector';

// Global matchMedia mock - must be set up before component renders
const createMatchMediaMock = (width: number) => (query: string) => ({
  matches: query.includes('(max-width:') ? width < 768 : width >= 768,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('TimeframeSelector', () => {
  beforeAll(() => {
    // Setup default matchMedia for desktop (window width >= 768)
    vi.spyOn(window, 'matchMedia').mockImplementation(createMatchMediaMock(1024));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // TDG Cycle 3.1: Click Handler
  describe('Click Handler', () => {
    it('should call onTimeframeChange with correct timeframe when clicked', () => {
      const handleChange = vi.fn();
      render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={handleChange} />);

      const button1h = screen.getByText('1H');
      fireEvent.click(button1h);

      expect(handleChange).toHaveBeenCalledWith('1H');
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should call onTimeframeChange with 1m timeframe when 1m button is clicked', () => {
      const handleChange = vi.fn();
      render(<TimeframeSelector activeTimeframe="1H" onTimeframeChange={handleChange} />);

      const button1m = screen.getByText('1m');
      fireEvent.click(button1m);

      expect(handleChange).toHaveBeenCalledWith('1m');
    });

    it('should call onTimeframeChange with all available timeframes', () => {
      const handleChange = vi.fn();
      render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={handleChange} />);

      const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

      timeframes.forEach(tf => {
        handleChange.mockClear();
        const button = screen.getByText(tf);
        fireEvent.click(button);
        expect(handleChange).toHaveBeenCalledWith(tf);
      });
    });
  });

  // TDG Cycle 3.2: Active State Styling
  describe('Active State Styling', () => {
    it('should apply active styles to selected timeframe', () => {
      render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={vi.fn()} />);

      const activeBtn = screen.getByText('15m');
      const inactiveBtn = screen.getByText('1H');

      expect(activeBtn).toHaveClass('text-[#40ffa9]');
      expect(inactiveBtn).not.toHaveClass('text-[#40ffa9]');
    });

    it('should show different active timeframe', () => {
      render(<TimeframeSelector activeTimeframe="1D" onTimeframeChange={vi.fn()} />);

      const activeBtn = screen.getByText('1D');
      const inactiveBtn = screen.getByText('15m');

      expect(activeBtn).toHaveClass('text-[#40ffa9]');
      expect(inactiveBtn).not.toHaveClass('text-[#40ffa9]');
    });

    it('should have exactly one active timeframe at a time', () => {
      render(<TimeframeSelector activeTimeframe="4H" onTimeframeChange={vi.fn()} />);

      const allButtons = screen.getAllByRole('button');
      const activeButtons = allButtons.filter(btn => btn.classList.contains('text-[#40ffa9]'));

      expect(activeButtons).toHaveLength(1);
      expect(activeButtons[0].textContent).toBe('4H');
    });
  });

  // TDG Cycle 3.3: Mobile Selector
  describe('Mobile Selector', () => {
    it('should render buttons on desktop (md breakpoint and above)', () => {
      render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={vi.fn()} />);

      // Desktop - should have buttons, no select
      const select = screen.queryByRole('combobox');
      expect(select).toBeNull();

      // Should have buttons for all timeframes
      const buttons = screen.getAllByRole('button');
      const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];
      expect(buttons.length).toBeGreaterThanOrEqual(timeframes.length);
    });

    it('should render select dropdown on mobile', () => {
      // Mock mobile viewport by changing both innerWidth and matchMedia
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      (window.matchMedia as ReturnType<typeof vi.spyOn>).mockImplementation(createMatchMediaMock(500));

      const { unmount } = render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={vi.fn()} />);

      const select = screen.queryByRole('combobox');
      expect(select).toBeInTheDocument();

      // Reset to desktop for other tests
      unmount();
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      (window.matchMedia as ReturnType<typeof vi.spyOn>).mockImplementation(createMatchMediaMock(1024));
    });
  });

  // TDG Cycle 3.4: localStorage Persistence
  describe('localStorage Persistence', () => {
    let setItemSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();

      // Setup localStorage mock - just spy, don't mock implementation
      setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    });

    afterEach(() => {
      setItemSpy.mockRestore();
      localStorage.clear();
    });

    it('should save timeframe to localStorage when changed', () => {
      const handleChange = vi.fn();
      render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={handleChange} />);

      const button1h = screen.getByText('1H');
      fireEvent.click(button1h);

      expect(setItemSpy).toHaveBeenCalledWith(
        'carbonx_chart_timeframe',
        '1H'
      );
    });

    it('should save all timeframe options to localStorage', () => {
      const handleChange = vi.fn();
      render(<TimeframeSelector activeTimeframe="15m" onTimeframeChange={handleChange} />);

      const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

      timeframes.forEach(tf => {
        setItemSpy.mockClear();
        const button = screen.getByText(tf);
        fireEvent.click(button);
        expect(setItemSpy).toHaveBeenCalledWith(
          'carbonx_chart_timeframe',
          tf
        );
      });
    });
  });
});
