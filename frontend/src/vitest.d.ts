import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare global {
  namespace Vi {
    interface Matchers extends TestingLibraryMatchers {}
  }

  // Add global for Vitest tests
  var global: typeof globalThis & {
    localStorage: Storage
    NodeJS?: {
      setTimeout: (callback: () => void, ms: number) => number
      setInterval: (callback: () => void, ms: number) => number
      clearTimeout: (id: number) => void
      clearInterval: (id: number) => void
    }
  }
}
