# TDG Configuration

## Project Information
- Language: TypeScript
- Framework: React 19 + Vite 7
- Package Manager: pnpm
- Test Framework: None configured (Vitest recommended)

## Build Command
```bash
cd frontend && pnpm build
```

## Type Check Command
```bash
cd frontend && pnpm tsc -b
```

## Lint Command
```bash
cd frontend && pnpm lint
```

## Test Command
```bash
cd frontend && pnpm test
# No test command configured - needs Vitest setup
```

## Single Test Command
```bash
cd frontend && pnpm test -- --run
```

## Coverage Command
```bash
cd frontend && pnpm test -- --coverage
```

## Test File Patterns
- Test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- Test directory: `__tests__/`, `tests/`
- Setup file: `vitest.setup.ts` (to be created)

## Setup Testing (Required)
```bash
cd frontend && pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Then add to `package.json` scripts:
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Notes
- This is a React + Vite project without existing tests
- Uses pnpm as package manager
- Current scripts: dev, build, lint, preview
- TypeScript version: ~5.9.3
- UI components: shadcn/ui with Radix UI primitives
