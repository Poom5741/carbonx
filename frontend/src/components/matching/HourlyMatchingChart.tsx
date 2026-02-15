import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { TimePeriod, HourlyData } from '../../hooks/matching/useHourlyMatching'
import { ErrorState } from '../common/ErrorBoundary'
import { LoadingState } from '../common/LoadingState'

interface HourlyMatchingChartProps {
  data: HourlyData[]
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  onPeriodChange?: (period: TimePeriod) => void
  className?: string
}

export const HourlyMatchingChart: React.FC<HourlyMatchingChartProps> = ({
  data,
  loading = false,
  error,
  onRetry,
  onPeriodChange,
  className = '',
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('day')
  const [animationComplete, setAnimationComplete] = useState(false)

  // Calculate statistics
  const matchedHours = data.filter(h => h.matched).length
  const cfePercentage = Math.round((matchedHours / data.length) * 100)
  const totalGeneration = data.reduce((sum, h) => sum + h.generation, 0)
  const totalConsumption = data.reduce((sum, h) => sum + h.consumption, 0)

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.generation, d.consumption)),
    100
  )

  // Animate stats on mount
  useEffect(() => {
    if (!chartRef.current || loading) return

    const tl = gsap.timeline({
      onComplete: () => setAnimationComplete(true)
    })

    // Animate bars in with dramatic effect
    const bars = barsRef.current?.querySelectorAll('[data-hour-bar]')
    if (bars) {
      tl.fromTo(bars,
        { scaleY: 0, opacity: 0 },
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.8,
          stagger: {
            each: 0.02,
            from: 'center'
          },
          ease: 'power3.out',
          transformOrigin: 'bottom',
        },
        0
      )
    }

    // Animate stats numbers
    const stats = chartRef.current.querySelectorAll('[data-stat-number]')
    stats.forEach(stat => {
      const finalValue = parseFloat(stat.getAttribute('data-final-value') || '0')
      gsap.to(stat, {
        innerHTML: finalValue,
        duration: 1.5,
        snap: { innerHTML: 1 },
        ease: 'power2.out',
      })
    })

    // Animate glow effect
    if (glowRef.current) {
      gsap.fromTo(glowRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 0.6, scale: 1, duration: 2, ease: 'power2.out' }
      )
    }

  }, [data, loading])

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period)
    onPeriodChange?.(period)
  }

  if (loading) {
    return (
      <div
        data-testid="hourly-matching-chart"
        className={`bg-gradient-to-br from-[#111827] to-[#0a0e17] rounded-2xl p-6 border border-white/5 ${className}`}
      >
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-6 w-48 bg-[#1a2234] rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-[#1a2234] rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                data-testid="chart-skeleton"
                className="w-16 h-8 bg-[#1a2234] rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Professional loading skeleton with shimmer */}
        <LoadingState type="chart" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        data-testid="hourly-matching-chart"
        className={`bg-gradient-to-br from-[#111827] to-[#0a0e17] rounded-2xl p-6 border border-white/5 ${className}`}
      >
        <div data-testid="chart-error-state">
          <ErrorState
            type="data-load"
            title="Energy Data Temporarily Unavailable"
            message="We're having trouble connecting to the energy monitoring system. This happens occasionally during maintenance."
            onRetry={onRetry}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={chartRef}
      data-testid="hourly-matching-chart"
      className={`relative bg-gradient-to-br from-[#111827] to-[#0a0e17] rounded-2xl p-6 border border-white/5 overflow-hidden ${className}`}
    >
      <style>{`
        @media (max-width: 768px) {
          .chart-header { flex-direction: column !important; align-items: flex-start !important; }
          .chart-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .hourly-chart { height: 250px !important; }
        }
      `}</style>
      {/* Animated glow background */}
      <div
        ref={glowRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(64, 255, 169, 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">24/7 Carbon-Free Energy</h2>
            {cfePercentage >= 70 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#40ffa9]/20 border border-[#40ffa9]/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#40ffa9] animate-pulse" />
                <span className="text-xs font-semibold text-[#40ffa9]">LIVE</span>
              </span>
            )}
          </div>
          <p className="text-[#6b7280] text-sm">
            Real-time energy matching at WHA Vietnam, Phase 3
          </p>
        </div>

        {/* CFE Score Badge */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-[#6b7280] uppercase tracking-wide">CFE Score</p>
            <p className={`text-3xl font-bold font-mono ${cfePercentage >= 70 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'}`}>
              {cfePercentage}%
            </p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          {/* Time Period Selector */}
          <div
            data-testid="time-selector"
            className="flex gap-1 bg-[#0a0e17] p-1 rounded-xl border border-white/5"
          >
            {(['day', 'week', 'month'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'bg-[#40ffa9] text-[#0a0e17] shadow-lg shadow-[#40ffa9]/20'
                    : 'text-[#6b7280] hover:text-white hover:bg-white/5'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="relative z-10 flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#40ffa9] shadow-lg shadow-[#40ffa9]/30" />
          <span className="text-sm text-[#9ca3af]">100% Carbon-Free</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-600" />
          <span className="text-sm text-[#9ca3af]">Grid Mix</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded bg-[#ff6b6b]" />
          <span className="text-sm text-[#9ca3af]">Over-Consumption</span>
        </div>
        <div className="ml-auto text-xs text-[#6b7280]">
          I-REC Standard Compliant
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 h-72">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 w-16 flex flex-col justify-between text-xs text-[#6b7280] font-mono">
          <span>{Math.round(maxValue)} kWh</span>
          <span>{Math.round(maxValue * 0.75)} kWh</span>
          <span>{Math.round(maxValue * 0.5)} kWh</span>
          <span>{Math.round(maxValue * 0.25)} kWh</span>
          <span>0</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-16 right-0 top-0 bottom-10 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-dashed border-white/5 w-full" />
          ))}
        </div>

        {/* Bars */}
        <div
          ref={barsRef}
          className="absolute left-16 right-0 top-0 bottom-10 flex items-end gap-0.5"
        >
          {data.map((hour, i) => {
            const generationHeight = (hour.generation / maxValue) * 100
            const consumptionHeight = (hour.consumption / maxValue) * 100
            const isHovered = hoveredBar === i
            const isPeakSolar = hour.hour >= 10 && hour.hour <= 14
            const isNight = hour.hour >= 0 && hour.hour <= 5

            return (
              <div
                key={hour.hour}
                data-testid={`hour-bar-${i}`}
                data-hour-bar
                data-generation={hour.generation}
                data-consumption={hour.consumption}
                data-matched={hour.matched}
                data-height={generationHeight}
                className="flex-1 flex flex-col items-center justify-end group relative"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Enhanced Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-[#1a2332]/95 backdrop-blur-xl border border-[#40ffa9]/30 rounded-xl p-4 shadow-2xl min-w-[180px]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-bold text-lg">
                          {String(hour.hour).padStart(2, '0')}:00
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          hour.matched
                            ? 'bg-[#40ffa9]/20 text-[#40ffa9]'
                            : 'bg-gray-600/50 text-gray-400'
                        }`}>
                          {hour.matched ? 'MATCHED' : 'GRID MIX'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#9ca3af]">Generation</span>
                          <span className="text-[#40ffa9] font-mono font-semibold">
                            {hour.generation.toFixed(1)} kWh
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#9ca3af]">Consumption</span>
                          <span className="text-white font-mono font-semibold">
                            {hour.consumption.toFixed(1)} kWh
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#9ca3af]">CFE</span>
                            <span className={`font-mono font-bold ${
                              hour.generation >= hour.consumption ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'
                            }`}>
                              {Math.round((hour.generation / Math.max(hour.consumption, 0.1)) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Glow effect */}
                      <div
                        className="absolute -inset-4 bg-[#40ffa9]/20 blur-xl -z-10 rounded-full"
                        style={{ opacity: hour.matched ? 0.5 : 0.2 }}
                      />
                    </div>
                    {/* Arrow */}
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#1a2332] mx-auto" />
                  </div>
                )}

                {/* Bar container with gradient */}
                <div className="relative w-full h-full flex items-end">
                  {/* Background bar (full height) */}
                  <div className="absolute inset-0 bg-white/5 rounded-t-sm overflow-hidden">
                    {/* Scanline effect for unmatched hours */}
                    {!hour.matched && (
                      <div className="absolute inset-0 opacity-20">
                        <div className="h-full w-full" style={{
                          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                        }} />
                      </div>
                    )}
                  </div>

                  {/* Generation bar */}
                  <div
                    className={`relative w-full rounded-t-sm transition-all duration-300 ${
                      hour.matched
                        ? 'bg-gradient-to-t from-[#0d7f54] to-[#40ffa9]'
                        : 'bg-gradient-to-t from-gray-700 to-gray-600'
                    } ${isHovered ? 'brightness-125 shadow-lg shadow-[#40ffa9]/20' : ''}`}
                    style={{ height: `${generationHeight}%` }}
                  >
                    {/* Shine effect on top */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />

                    {/* Inner glow for matched hours */}
                    {hour.matched && (
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-[#40ffa9]/40 to-transparent rounded-t-sm"
                      />
                    )}
                  </div>

                  {/* Consumption indicator line */}
                  <div
                    className={`absolute w-full transition-all duration-300 ${
                      hour.consumption > hour.generation
                        ? 'bg-[#ff6b6b] shadow-lg shadow-[#ff6b6b]/30'
                        : 'bg-white/40'
                    }`}
                    style={{
                      bottom: `${consumptionHeight}%`,
                      height: '3px'
                    }}
                  />

                  {/* Peak hour highlight */}
                  {isPeakSolar && hour.matched && animationComplete && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
                    </div>
                  )}
                </div>

                {/* Night indicator */}
                {isNight && i % 3 === 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-30">
                    <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* X-axis labels with day/night indicator */}
        <div className="absolute left-16 right-0 bottom-0">
          <div className="flex justify-between text-xs text-[#6b7280] mb-1">
            {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((time, i) => (
              <span key={time} className={i % 2 === 0 ? '' : 'opacity-50'}>{time}</span>
            ))}
          </div>
          {/* Day/Night gradient bar */}
          <div className="h-1 rounded-full bg-gradient-to-r from-blue-900/50 via-yellow-500/30 to-blue-900/50" />
        </div>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="relative z-10 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
        <div className="text-center p-3 rounded-xl bg-[#0a0e17]/50 border border-white/5">
          <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Matched Hours</p>
          <p className="text-2xl font-bold text-[#40ffa9] font-mono">
            {matchedHours}
            <span className="text-sm text-[#6b7280] ml-1">/ 24h</span>
          </p>
        </div>
        <div className="text-center p-3 rounded-xl bg-[#0a0e17]/50 border border-white/5">
          <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Total Generation</p>
          <p
            className="text-2xl font-bold text-white font-mono"
            data-stat-number
            data-final-value={totalGeneration.toFixed(0)}
          >
            0
          </p>
          <p className="text-xs text-[#6b7280]">kWh</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-[#0a0e17]/50 border border-white/5">
          <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Total Consumption</p>
          <p
            className="text-2xl font-bold text-white font-mono"
            data-stat-number
            data-final-value={totalConsumption.toFixed(0)}
          >
            0
          </p>
          <p className="text-xs text-[#6b7280]">kWh</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-[#0a0e17]/50 border border-[#40ffa9]/20">
          <p className="text-xs text-[#40ffa9] uppercase tracking-wide mb-1">Carbon Offset</p>
          <p
            className="text-2xl font-bold text-[#40ffa9] font-mono"
            data-stat-number
            data-final-value={(totalGeneration * 0.5).toFixed(0)}
          >
            0
          </p>
          <p className="text-xs text-[#6b7280]">kg CO₂e</p>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-[#6b7280]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Solar + Wind
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            WHA Vietnam
          </span>
        </div>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Real-time data
        </span>
      </div>
    </div>
  )
}
