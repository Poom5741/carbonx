import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface ComplianceScoreProps {
  cfePercentage: number
  matchedHours?: number
  totalEnergy?: number
  location?: string
  targetThreshold?: number
  iRecCompatible?: boolean
  animate?: boolean
  className?: string
}

export const ComplianceScore: React.FC<ComplianceScoreProps> = ({
  cfePercentage,
  matchedHours,
  totalEnergy,
  location = 'WHA Vietnam, Phase 3',
  targetThreshold = 70,
  iRecCompatible = true,
  animate = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<SVGSVGElement>(null)
  const [animatedValue, setAnimatedValue] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!animate || !circleRef.current) return

    // Animate circular progress
    const circle = circleRef.current.querySelector('circle.progress-circle')
    if (!circle) return

    const circumference = 2 * Math.PI * 54 // radius = 54
    const offset = circumference - (cfePercentage / 100) * circumference

    gsap.to(circle, {
      strokeDashoffset: offset,
      duration: 1.5,
      ease: 'power3.out',
    })

    // Animate percentage number
    gsap.to(
      { value: 0 },
      {
        value: cfePercentage,
        duration: 1.5,
        ease: 'power3.out',
        onUpdate: function () {
          setAnimatedValue(Math.round(this.targets()[0].value))
        },
      }
    )

    // Entrance animation for the container
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
  }, [cfePercentage, animate])

  // Determine compliance status
  const getComplianceStatus = () => {
    if (cfePercentage >= 90) {
      return { label: 'Excellent', color: 'text-[#40ffa9]', bgColor: 'bg-[#40ffa9]/20', borderColor: 'border-[#40ffa9]/30' }
    } else if (cfePercentage >= targetThreshold) {
      return { label: 'CFE Compliant', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' }
    } else if (cfePercentage >= targetThreshold - 10) {
      return { label: 'Near Target', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' }
    } else {
      return { label: 'Below Target', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' }
    }
  }

  const status = getComplianceStatus()
  const circumference = 2 * Math.PI * 54

  return (
    <div
      ref={containerRef}
      data-testid="compliance-score"
      className={`relative bg-gradient-to-br from-[#111827] to-[#0a0e17] rounded-2xl p-6 border border-white/5 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background glow */}
      {cfePercentage >= targetThreshold && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(64, 255, 169, 0.08) 0%, transparent 70%)',
            opacity: isHovered ? 1 : 0.3,
          }}
        />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Circular Progress */}
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              cfePercentage >= targetThreshold
                ? 'bg-[#40ffa9]/10 blur-xl'
                : 'bg-gray-600/10 blur-xl'
            }`}
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />

          <svg
            ref={circleRef}
            data-testid="progress-circle"
            data-animate={animate}
            width="160"
            height="160"
            className="transform -rotate-90 relative z-10"
          >
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="54"
              fill="none"
              stroke="#1a2234"
              strokeWidth="14"
            />

            {/* Progress circle */}
            <circle
              className="progress-circle"
              cx="80"
              cy="80"
              r="54"
              fill="none"
              stroke={cfePercentage >= targetThreshold ? '#40ffa9' : '#ff6b6b'}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              style={{
                filter: cfePercentage >= targetThreshold
                  ? 'drop-shadow(0 0 8px rgba(64, 255, 169, 0.5))'
                  : 'none',
              }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold font-mono text-white">
              {animatedValue}%
            </span>
            <span className="text-xs text-[#6b7280] uppercase tracking-wide mt-1">
              CFE Score
            </span>
          </div>

          {/* Spinning particles for excellent score */}
          {cfePercentage >= 90 && animate && (
            <div className="absolute inset-0 -m-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-[#40ffa9] rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    animation: `spin 3s linear infinite`,
                    animationDelay: `${i * 1}s`,
                    transformOrigin: '0 -74px',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 text-center md:text-left">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-2">
            Carbon-Free Energy
            {iRecCompatible && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-medium text-blue-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                I-REC
              </span>
            )}
          </h3>

          {/* Status Badge */}
          <div
            data-testid="compliance-badge"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${status.bgColor} ${status.color} ${status.borderColor} text-sm font-semibold mb-4 transition-all duration-300`}
            style={{
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span className={`w-2 h-2 rounded-full ${cfePercentage >= targetThreshold ? 'bg-[#40ffa9]' : 'bg-current'} animate-pulse`} />
            {status.label}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Location */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm bg-[#0a0e17]/50 rounded-lg p-2 border border-white/5">
              <svg className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[#9ca3af] truncate">{location}</span>
            </div>

            {/* Matched Hours */}
            {matchedHours !== undefined && (
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm bg-[#0a0e17]/50 rounded-lg p-2 border border-white/5">
                <svg className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-mono">{matchedHours}h</span>
                <span className="text-[#6b7280]">matched</span>
              </div>
            )}

            {/* Total Energy */}
            {totalEnergy !== undefined && (
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm bg-[#0a0e17]/50 rounded-lg p-2 border border-white/5">
                <svg className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-white font-mono">{totalEnergy} kWh</span>
              </div>
            )}

            {/* Target */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm bg-[#0a0e17]/50 rounded-lg p-2 border border-white/5">
              <svg className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-[#6b7280]">Target:</span>
              <span className="text-white font-mono">{targetThreshold}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between text-xs text-[#6b7280] mb-2">
          <span>Progress to Target</span>
          <span>{Math.max(0, cfePercentage - targetThreshold + 1)}% above target</span>
        </div>
        <div className="h-2 bg-[#0a0e17] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              cfePercentage >= targetThreshold
                ? 'bg-gradient-to-r from-[#0d7f54] to-[#40ffa9]'
                : 'bg-gradient-to-r from-orange-600 to-orange-400'
            }`}
            style={{
              width: `${Math.min(100, (cfePercentage / targetThreshold) * 100)}%`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) translateX(-80px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(-80px) rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}
