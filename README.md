# Next.js 16 App - Deployment Ready

A production-ready Next.js 16 application with Tailwind CSS and shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 16.2.6 with App Router
- **Styling**: Tailwind CSS v4 with CSS Variables
- **Components**: shadcn/ui (base-nova style)
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics
- **Package Manager**: pnpm

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   └── utils.ts          # Utility functions (cn helper)
├── public/               # Static assets
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 20+ 
- pnpm (recommended) or npm/yarn

### Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set environment variables (if needed):**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Run development server:**
   ```bash
   pnpm dev
   ```

4. **Open browser:**
   - Navigate to http://localhost:3000

### Build for Production

```bash
pnpm build
pnpm start
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Vercel is the platform built by Next.js creators and provides zero-config deployment.

1. **Push code to GitHub**
2. **Connect repository at** https://vercel.com/new
3. **Vercel will automatically:**
   - Detect Next.js
   - Run `next build`
   - Deploy to CDN
   - Set up CI/CD

No configuration needed - it just works!

### Option 2: Deploy to Fly.io

This project includes a pre-configured `fly.toml` for Fly.io deployment.

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly:**
   ```bash
   flyctl auth login
   ```

3. **Create and deploy app:**
   ```bash
   flyctl launch
   flyctl deploy
   ```

4. **View logs:**
   ```bash
   flyctl logs
   ```

### Option 3: Deploy to Docker-based Platforms (Railway, Render, etc.)

The `.dockerignore` file is configured for optimal Docker builds.

1. **Ensure `npm start` works locally:**
   ```bash
   pnpm build
   pnpm start
   ```

2. **Connect your GitHub repo** to your hosting platform
3. **Platform will automatically build and deploy**

### Option 4: Manual Deployment

For any Node.js-compatible hosting:

```bash
# 1. Install production dependencies only
npm ci --omit=dev

# 2. Build the app
npm run build

# 3. Start the server (runs on port 3000)
npm start
```

Ensure your hosting platform:
- Supports Node.js 20+
- Allows port 3000 (or configure PORT env var)
- Has sufficient memory (512MB minimum)

## Environment Variables

### Optional Variables

```env
# Next.js automatically detects NODE_ENV
# NODE_ENV=production

# For analytics (if using)
# NEXT_PUBLIC_ANALYTICS_ID=your_id
```

### Adding New Variables

1. Add to `.env.example`:
   ```env
   MY_VAR=description
   ```

2. Add to `.env.local` (local development):
   ```env
   MY_VAR=value
   ```

3. Add to deployment platform settings (Vercel, Fly.io, etc.)

4. Use in code:
   - **Public variables** (accessible in browser): Prefix with `NEXT_PUBLIC_`
     ```tsx
     const id = process.env.NEXT_PUBLIC_ANALYTICS_ID
     ```
   - **Private variables** (server-only): No prefix
     ```tsx
     const secret = process.env.NEXT_PUBLIC_API_KEY // Only works in API routes
     ```

## Configuration

### Next.js Config (`next.config.mjs`)

- **React Compiler**: Enabled for optimized component rendering
- **SWC Minify**: Enabled for faster builds
- **Image Optimization**: Disabled (unoptimized: true) for better compatibility
- **Source Maps**: Disabled in production for smaller bundle size

### Tailwind Config

- **CSS Variables**: Enabled for dynamic theming
- **Base Color**: Neutral
- **Preset**: base-nova (from shadcn/ui)

### TypeScript Config

- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` maps to project root
- **Module Resolution**: bundler (optimized for bundlers)

## Performance Optimizations

✅ React 19 with concurrent rendering
✅ Next.js 16 with Turbopack
✅ Automatic code splitting
✅ Tree-shaking enabled
✅ Image optimization configured
✅ CSS-in-JS with Tailwind (zero runtime)
✅ Server Components by default

## Adding Components

### Add from shadcn/ui

```bash
pnpm exec shadcn-ui@latest add button
pnpm exec shadcn-ui@latest add card
pnpm exec shadcn-ui@latest add form
```

Components are added to `components/ui/` and ready to use.

### Use in Your Code

```tsx
import { Button } from '@/components/ui/button'

export default function Page() {
  return <Button>Click me</Button>
}
```

## Common Issues & Solutions

### Build fails with "Cannot find module"

```bash
# Clear cache and reinstall
rm -rf node_modules .next pnpm-lock.yaml
pnpm install
```

### Port 3000 already in use

```bash
# Use a different port
PORT=3001 pnpm dev
```

### Deployment fails on Vercel

Check that:
- ✅ `next.config.mjs` exports valid config
- ✅ No server-side code in `/public` or client components
- ✅ All dependencies in `package.json`
- ✅ `pnpm build` succeeds locally

### Deployment fails on Fly.io

```bash
# Check logs
flyctl logs

# Rebuild and redeploy
flyctl deploy --build
```

## Development Tips

### Debug Mode

Add debug logging:
```tsx
console.log('[v0] message:', value)
```

### Hot Reload

Changes to files automatically reload in browser during development. Edit any `.tsx`, `.ts`, or `.css` file and see changes instantly.

### Type Checking

```bash
# Check TypeScript without building
pnpm tsc --noEmit
```

### Lint Code

```bash
# Run ESLint
pnpm lint
```

## Production Checklist

Before deploying to production:

- [ ] All environment variables set in deployment platform
- [ ] `pnpm build` runs successfully locally
- [ ] `pnpm start` runs without errors
- [ ] No console errors in browser DevTools
- [ ] Responsive design tested on mobile
- [ ] Analytics tracking configured (if using)
- [ ] Meta tags and metadata updated
- [ ] Security headers configured (if needed)
- [ ] Rate limiting configured for API routes (if needed)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel Platform](https://vercel.com)
- [React Documentation](https://react.dev)

## License

MIT - Feel free to use for personal and commercial projects.
