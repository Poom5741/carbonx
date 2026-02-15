# TDG Configuration

## Project Information
- Language: TypeScript
- Framework: React 19 + Vite 7
- Package Manager: pnpm
- Test Framework: Vitest 4 + Testing Library + jsdom

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
```

## Single Test Command
```bash
# Run a specific test file
cd frontend && pnpm test path/to/test.test.tsx

# Run tests matching a pattern
cd frontend && pnpm test --testNamePattern="pattern"
```

## Coverage Command
```bash
cd frontend && pnpm test:coverage
```

## Test UI
```bash
cd frontend && pnpm test:ui
```

## Test File Patterns
- Test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- Test setup: `frontend/src/vitest.setup.ts`
- Config: `frontend/vitest.config.ts`

## Vitest Configuration
- Environment: jsdom
- Pool: forked (singleThread: true, isolate: false)
- Coverage provider: v8
- Reporters: text, json, html
- Global API: enabled (vitest/globals)
- Path alias: `@/` → `frontend/src/`

## Existing Tests
This project has 24 test files covering:
- Components: Portfolio, Trading, Matching, Stats, Transitions, Common
- Hooks: useTrading, useHourlyMatching, useKeyboardShortcuts, useCFECompliance, useOrderBook, useRealtimePrices, useResetDemo
- Pages: PortfolioPage, App
- Data: demoData utilities

## Notes
- Uses pnpm as package manager
- TypeScript version: ~5.9.3
- UI components: shadcn/ui with Radix UI primitives
- Test dependencies installed: vitest, @vitest/ui, @vitest/coverage-v8, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
