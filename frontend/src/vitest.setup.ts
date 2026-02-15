import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend expect with matchers
expect.extend(matchers)

// Add type declarations for jest-dom
import '@testing-library/jest-dom'

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver for Recharts ResponsiveContainer
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock as any

// Mock GSAP - properly return actual exports
vi.mock('gsap', async (importOriginal) => {
  const actual = await importOriginal<typeof import('gsap')>()
  return {
    ...actual,
    // Add any specific mocks if needed
  }
})

// Add global type declarations for NodeJS
declare global {
  var NodeJS: {
    setTimeout: (callback: () => void, ms: number) => number
    clearInterval: (id: number) => void
    clearTimeout: (id: number) => void
  }
}

afterEach(() => {
  cleanup()
})
