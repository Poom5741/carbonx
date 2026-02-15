import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CertificatePreview } from './CertificatePreview'

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    text: vi.fn(),
    rect: vi.fn(),
    setFillColor: vi.fn(),
    setTextColor: vi.fn(),
    setFontSize: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}))

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({ toDataURL: () => 'data:image/png;base64,abc123' })),
}))

const mockCertificate = {
  id: 'CERT-2024-001',
  location: 'WHA Vietnam, Phase 3',
  source: 'Solar + Wind',
  cfePercentage: 85,
  matchedHours: 20,
  totalEnergy: 450.5,
  issuedAt: new Date('2024-01-15T10:00:00Z'),
  expiresAt: new Date('2025-01-15T10:00:00Z'),
  issuer: 'CarbonX Energy Registry',
  certificateNumber: 'I-REC-123456789',
}

describe('CertificatePreview', () => {
  it('should render the certificate preview', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByTestId('certificate-preview')).toBeInTheDocument()
  })

  it('should display certificate ID', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('CERT-2024-001')).toBeInTheDocument()
  })

  it('should display location', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('WHA Vietnam, Phase 3')).toBeInTheDocument()
  })

  it('should display energy source', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('Solar + Wind')).toBeInTheDocument()
  })

  it('should display CFE percentage', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('should display matched hours', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('20h')).toBeInTheDocument()
  })

  it('should display total energy', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('450.5 kWh')).toBeInTheDocument()
  })

  it('should display issue date', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
  })

  it('should display expiry date', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('should display I-REC certificate number', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('I-REC-123456789')).toBeInTheDocument()
  })

  it('should have export button', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByTestId('export-button')).toBeInTheDocument()
    expect(screen.getByText(/export/i)).toBeInTheDocument()
  })

  it('should call onExport when export button is clicked', () => {
    const onExport = vi.fn()
    render(<CertificatePreview certificate={mockCertificate} onExport={onExport} />)

    const exportButton = screen.getByTestId('export-button')
    fireEvent.click(exportButton)

    expect(onExport).toHaveBeenCalled()
  })

  it('should show loading state during export', () => {
    render(<CertificatePreview certificate={mockCertificate} isExporting={true} />)

    expect(screen.getByTestId('export-spinner')).toBeInTheDocument()
  })

  it('should display QR code placeholder', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByTestId('qr-code-placeholder')).toBeInTheDocument()
  })

  it('should have certificate styling', () => {
    const { container } = render(<CertificatePreview certificate={mockCertificate} />)

    const certificate = container.querySelector('[data-testid="certificate-preview"]')
    expect(certificate).toBeInTheDocument()
    expect(certificate).toHaveClass('bg-[#111827]')
    expect(certificate).toHaveClass('rounded-xl')
  })

  it('should display issuer information', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByText('CarbonX Energy Registry')).toBeInTheDocument()
  })

  it('should animate on mount', () => {
    const { container } = render(<CertificatePreview certificate={mockCertificate} animate={true} />)

    const certificate = container.querySelector('[data-testid="certificate-preview"]')
    expect(certificate).toHaveAttribute('data-animate', 'true')
  })

  it('should handle download format selection', () => {
    render(<CertificatePreview certificate={mockCertificate} />)

    expect(screen.getByTestId('format-selector')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('PNG')).toBeInTheDocument()
  })

  it('should show verification badge', () => {
    render(<CertificatePreview certificate={mockCertificate} showVerification={true} />)

    expect(screen.getByText(/verified/i)).toBeInTheDocument()
    expect(screen.getByTestId('verification-badge')).toBeInTheDocument()
  })
})
