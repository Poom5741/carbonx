import { useState, useEffect } from 'react';

export type TimeframeValue = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W';

export interface TimeframeSelectorProps {
  activeTimeframe: TimeframeValue;
  onTimeframeChange: (timeframe: TimeframeValue) => void;
}

const TIMEFRAMES: TimeframeValue[] = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

const LOCAL_STORAGE_KEY = 'carbonx_chart_timeframe';

/**
 * TimeframeSelector component for chart timeframe selection.
 *
 * Features:
 * - Desktop: Shows buttons for each timeframe
 * - Mobile: Shows select dropdown
 * - Active timeframe highlighted with accent color (#40ffa9)
 * - Saves selection to localStorage
 */
export default function TimeframeSelector({
  activeTimeframe,
  onTimeframeChange,
}: TimeframeSelectorProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    mediaQuery.addEventListener('change', checkMobile);

    return () => {
      mediaQuery.removeEventListener('change', checkMobile);
    };
  }, []);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: TimeframeValue) => {
    onTimeframeChange(timeframe);
    // Save to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, timeframe);
  };

  // Mobile view: select dropdown
  if (isMobile) {
    return (
      <select
        value={activeTimeframe}
        onChange={(e) => handleTimeframeChange(e.target.value as TimeframeValue)}
        className="bg-[#1a1f2e] text-white border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#40ffa9]"
        role="combobox"
      >
        {TIMEFRAMES.map((tf) => (
          <option key={tf} value={tf}>
            {tf}
          </option>
        ))}
      </select>
    );
  }

  // Desktop view: buttons
  return (
    <div className="flex items-center gap-2">
      {TIMEFRAMES.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => handleTimeframeChange(timeframe)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTimeframe === timeframe
              ? 'text-[#40ffa9]'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          aria-label={`Select ${timeframe} timeframe`}
          aria-pressed={activeTimeframe === timeframe}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
}
