# Blockedge Exchange Frontend

A modern React + TypeScript + Vite frontend application with Tailwind CSS and Radix UI components.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 3
- **UI Components:** Radix UI + shadcn/ui
- **Routing:** React Router DOM 7
- **Charts:** Recharts, Lightweight Charts
- **Animation:** GSAP

## Prerequisites

- Node.js 20.19+ or 22.12+ (Vite 7 requirement)
- pnpm (recommended) or npm
- nvm (recommended for Node version management)

## Node Version Setup (with nvm)

This project includes an `.nvmrc` file specifying Node 22.14.0 (LTS).

### Install nvm (if not already installed)

**macOS/Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

**Windows:**
Use [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) or install via winget:
```bash
winget install CoreyButler.NVMforWindows
```

After installation, restart your terminal.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install and use the correct Node version:**
   ```bash
   nvm install
   nvm use
   ```

   Or if you already have the version installed:
   ```bash
   nvm use
   ```

3. **Verify Node version:**
   ```bash
   node -v  # Should show v22.14.0 or compatible
   ```

## Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build for production (runs TypeScript compiler + Vite build) |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint |

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from the frontend directory:**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts:**
   - Confirm project settings
   - Vercel will auto-detect Vite and configure build settings

### Option 2: Deploy via Git Integration

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import project on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Select the `frontend` folder as the root directory

3. **Configure build settings (if not auto-detected):**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`

4. **Deploy:**
   Click "Deploy" and Vercel will build and host your application

### Vercel Configuration (Optional)

Create a `vercel.json` in the `frontend` directory for custom configuration:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # UI components (shadcn/radix)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── dist/               # Build output (generated)
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## Environment Variables

Create a `.env` file in the `frontend` directory for local development:

```env
# API endpoint
VITE_API_URL=http://localhost:3000/api
```

For Vercel deployment, add environment variables in:
- **Vercel Dashboard** → Project Settings → Environment Variables

## Troubleshooting

### Build fails on Vercel
- Ensure **Root Directory** is set to `frontend` in project settings
- Check that `vite.config.ts` exists and is properly configured

### Port already in use (local dev)
- Vite will automatically try the next available port
- Or specify a port: `pnpm dev -- --port 3000`

### Module resolution errors
- The project uses path aliases (`@/`)
- These are configured in `vite.config.ts` and `tsconfig.json`
