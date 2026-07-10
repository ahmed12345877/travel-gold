# Quick Start Guide

## 🚀 Deploy in 30 Seconds (Vercel)

The absolute fastest way to deploy:

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to https://vercel.com/new**

3. **Import your repository** and click Deploy

✅ **Done!** Your app is live at `<your-project>.vercel.app`

---

## 💻 Local Development

```bash
# Install dependencies (first time only)
pnpm install

# Start development server
pnpm dev

# Open in browser
# http://localhost:3000
```

### Make a change

1. Edit `app/page.tsx` 
2. Save the file
3. See changes instantly in browser (hot reload)

---

## 🏗️ Build for Production

```bash
# Test the production build locally
pnpm build
pnpm start

# Your app runs at http://localhost:3000
```

---

## 📝 Project Structure

```
my-project/
├── app/                  # Pages and routes
│   ├── page.tsx         # Home page
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── lib/                # Utilities
├── public/             # Static files (images, icons)
└── package.json        # Dependencies
```

---

## 🎨 Customize Your App

### Change the home page

Edit `app/page.tsx`:

```tsx
export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome!</h1>
    </main>
  )
}
```

### Add a new page

Create `app/about/page.tsx`:

```tsx
export default function AboutPage() {
  return <h1>About Us</h1>
}
```

Access at `/about`

### Use shadcn components

```tsx
import { Button } from '@/components/ui/button'

export default function Page() {
  return <Button>Click me</Button>
}
```

### Add a component

Create `components/my-component.tsx`:

```tsx
export function MyComponent() {
  return <div>Hello</div>
}
```

Use it:

```tsx
import { MyComponent } from '@/components/my-component'

export default function Page() {
  return <MyComponent />
}
```

---

## 🔧 Add Components from shadcn

```bash
pnpm exec shadcn-ui@latest add button
pnpm exec shadcn-ui@latest add card
pnpm exec shadcn-ui@latest add input
pnpm exec shadcn-ui@latest add form
```

---

## 🌍 Environment Variables

### Add a secret (server-only)

1. Create `.env.local` (git-ignored):
   ```env
   MY_API_KEY=secret-value
   ```

2. Use in your code:
   ```tsx
   const apiKey = process.env.MY_API_KEY
   ```

### Add a public variable

1. Prefix with `NEXT_PUBLIC_`:
   ```env
   NEXT_PUBLIC_API_URL=https://api.example.com
   ```

2. Use in browser code:
   ```tsx
   const apiUrl = process.env.NEXT_PUBLIC_API_URL
   ```

---

## 📦 Install New Packages

```bash
# Install a package
pnpm add package-name

# Install dev dependency
pnpm add -D package-name

# Remove a package
pnpm remove package-name

# Update all packages
pnpm up
```

---

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
pnpm install
```

### Port 3000 already in use
```bash
PORT=3001 pnpm dev
```

### Type errors
```bash
# Check TypeScript
pnpm tsc --noEmit

# Or ignore them for now
# (they won't block build)
```

### Build fails
```bash
# Check for errors locally
pnpm build

# See full output if it fails
pnpm build 2>&1
```

---

## 📚 Useful Commands

```bash
# Development
pnpm dev              # Start dev server

# Production
pnpm build            # Build for production
pnpm start            # Run production build locally

# Code quality
pnpm lint             # Run linter
pnpm tsc --noEmit    # Check TypeScript types

# Cleanup
pnpm install          # Reinstall dependencies
rm -rf .next          # Clear Next.js cache
```

---

## 🚀 Deployment Options

| Platform | Time | Complexity | Cost |
|----------|------|-----------|------|
| **Vercel** | 1 min | None | Free ✅ |
| **Fly.io** | 5 min | Low | ~$5/mo |
| **Railway** | 5 min | Low | ~$7/mo |
| **Render** | 5 min | Low | ~$7/mo |

**→ Use Vercel unless you have specific needs**

---

## 📖 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [React Documentation](https://react.dev)

---

## ✅ Deployment Checklist

Before deploying:

- [ ] `pnpm build` succeeds
- [ ] No console errors in dev
- [ ] Responsive on mobile (test with DevTools)
- [ ] All images have alt text
- [ ] Meta tags are set (title, description)
- [ ] Environment variables configured
- [ ] `.env.example` updated
- [ ] Code pushed to GitHub

**Then deploy to Vercel!** 🎉

---

## 🆘 Need Help?

- Check `README.md` for detailed setup
- Check `DEPLOYMENT.md` for deployment options
- Search [Next.js docs](https://nextjs.org/docs)
- Check [shadcn/ui docs](https://ui.shadcn.com)
