import React, { useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { CertificateData } from '../../hooks/matching/useHourlyMatching'

interface CertificatePreviewProps {
  certificate: CertificateData
  onExport?: (certificate: CertificateData) => void
  isExporting?: boolean
  animate?: boolean
  showVerification?: boolean
  className?: string
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificate,
  onExport,
  isExporting = false,
  animate = true,
  showVerification = true,
  className = '',
}) => {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png'>('pdf')

  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Handle export
  const handleExport = () => {
    onExport?.(certificate)

    // Trigger animation
    if (certificateRef.current) {
      gsap.to(certificateRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      })
    }
  }

  // Entrance animation
  React.useEffect(() => {
    if (!animate || !certificateRef.current) return

    gsap.fromTo(certificateRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
    )
  }, [certificate.id, animate])

  return (
    <div
      ref={certificateRef}
      data-testid="certificate-preview"
      data-animate={animate}
      className={`bg-[#111827] rounded-xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Energy Certificate</h2>
          <p className="text-[#6b7280] text-sm">I-REC Standard Compliant</p>
        </div>

        <div className="flex gap-2">
          {/* Format Selector */}
          <div
            data-testid="format-selector"
            className="flex bg-[#0a0e17] rounded-lg p-1"
          >
            {(['pdf', 'png'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  exportFormat === format
                    ? 'bg-[#40ffa9] text-[#0a0e17]'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            data-testid="export-button"
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isExporting
                ? 'bg-[#1a2234] text-[#6b7280] cursor-not-allowed'
                : 'bg-[#40ffa9] text-[#0a0e17] hover:brightness-110'
            }`}
          >
            {isExporting ? (
              <>
                <div
                  data-testid="export-spinner"
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                />
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Certificate Card */}
      <div className="relative bg-gradient-to-br from-[#0a0e17] to-[#1a2234] border-2 border-[#40ffa9] rounded-xl p-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#40ffa9] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#40ffa9] rounded-full blur-3xl" />
        </div>

        {/* Verification Badge */}
        {showVerification && (
          <div
            data-testid="verification-badge"
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[#40ffa9]/20 border border-[#40ffa9]/30 rounded-full"
          >
            <svg className="w-4 h-4 text-[#40ffa9]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-[#40ffa9]">Verified</span>
          </div>
        )}

        <div className="relative z-10">
          {/* Certificate Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#40ffa9]/10 border border-[#40ffa9]/30 rounded-full mb-4">
              <svg className="w-5 h-5 text-[#40ffa9]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-[#40ffa9]">Energy Attribute Certificate</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{certificate.id}</h3>
            <p className="text-[#6b7280] text-sm">I-REC Standard</p>
          </div>

          {/* Certificate Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Location */}
            <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-white/5">
              <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Location</p>
              <p className="text-white font-semibold">{certificate.location}</p>
            </div>

            {/* Energy Source */}
            <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-white/5">
              <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Energy Source</p>
              <p className="text-white font-semibold">{certificate.source}</p>
            </div>

            {/* CFE Percentage */}
            <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-white/5">
              <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">CFE Percentage</p>
              <p className={`text-2xl font-bold font-mono ${
                certificate.cfePercentage >= 70 ? 'text-[#40ffa9]' : 'text-[#ff6b6b]'
              }`}>
                {certificate.cfePercentage}%
              </p>
            </div>

            {/* Matched Hours */}
            <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-white/5">
              <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Matched Hours</p>
              <p className="text-2xl font-bold font-mono text-white">{certificate.matchedHours}h</p>
            </div>

            {/* Total Energy */}
            <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-white/5">
              <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Total Energy</p>
              <p className="text-2xl font-bold font-mono text-white">{certificate.totalEnergy} kWh</p>
            </div>

            {/* I-REC Number */}
            <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-white/5">
              <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Certificate No.</p>
              <p className="text-white font-mono text-sm">{certificate.certificateNumber}</p>
            </div>
          </div>

          {/* Dates and Issuer */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/10 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Issued</p>
              <p className="text-white text-sm">{formatDate(certificate.issuedAt)}</p>
            </div>

            {/* QR Code Placeholder */}
            <div
              data-testid="qr-code-placeholder"
              className="w-16 h-16 bg-white rounded-lg flex items-center justify-center"
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" fill="black" />
                <rect x="14" y="3" width="7" height="7" fill="black" />
                <rect x="3" y="14" width="7" height="7" fill="black" />
                <rect x="14" y="14" width="3" height="3" fill="black" />
                <rect x="18" y="14" width="3" height="3" fill="black" />
                <rect x="14" y="18" width="3" height="3" fill="black" />
                <rect x="18" y="18" width="3" height="3" fill="black" />
              </svg>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Expires</p>
              <p className="text-white text-sm">{formatDate(certificate.expiresAt)}</p>
            </div>
          </div>

          {/* Issuer */}
          <div className="mt-4 text-center">
            <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Issued By</p>
            <p className="text-white font-semibold">{certificate.issuer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
