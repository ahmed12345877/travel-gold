# Deployment Guide

This guide covers all deployment options for your Next.js 16 application.

## Quick Start Deployment

### ⚡ Vercel (Recommended - 1 minute)

The easiest and most recommended way to deploy Next.js apps.

1. **Push code to GitHub**
2. **Go to https://vercel.com/new**
3. **Import your repository**
4. **Click Deploy**

That's it! Vercel automatically:
- ✅ Detects Next.js
- ✅ Installs dependencies
- ✅ Builds the app
- ✅ Deploys to global CDN
- ✅ Sets up CI/CD
- ✅ Provides custom domain support
- ✅ Enables analytics

**No config needed. It just works!**

---

## Detailed Deployment Options

### Option 1: Vercel Platform

**Best for:** Production apps, team collaboration, enterprise features

**Setup time:** < 2 minutes

**Cost:** Free tier available

**Steps:**

1. Connect your GitHub, GitLab, or Bitbucket repo to Vercel
2. Vercel automatically deploys on every push to `main` branch
3. Access your app at `<project>.vercel.app`

**Features included:**
- Global CDN
- Automatic SSL/TLS
- Custom domains
- Environment variables UI
- Analytics dashboard
- Preview deployments for PRs
- Automatic rollbacks
- Edge middleware support

**Environment variables:**

```bash
# In Vercel dashboard: Settings → Environment Variables
NEXT_PUBLIC_ANALYTICS_ID=your_id
```

---

### Option 2: Fly.io

**Best for:** Docker deployments, global edge computing, cost control

**Setup time:** 5-10 minutes

**Cost:** Pay-as-you-go (very affordable)

**Prerequisites:**

```bash
# Install Fly CLI
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
choco install flyctl
```

**Deployment steps:**

```bash
# 1. Login
flyctl auth login

# 2. Launch app (one-time setup)
flyctl launch

# 3. Deploy
flyctl deploy

# 4. View live app
flyctl open

# 5. View logs
flyctl logs

# 6. SSH into instance
flyctl ssh console
```

**Environment variables:**

```bash
# Add environment variables
flyctl secrets set MY_VAR=value

# View all secrets
flyctl secrets list

# Remove a secret
flyctl secrets unset MY_VAR
```

**Scaling:**

```bash
# Scale to multiple regions
flyctl regions set sfo ord lon

# View current config
flyctl config show

# Update RAM/CPU
flyctl scale vm shared-cpu-1x --memory 256
```

---

### Option 3: Docker (Railway, Render, Replit, etc.)

**Best for:** Multi-platform deployment flexibility

**Setup time:** 10-15 minutes

**Platforms supporting Docker:**
- Railway.app
- Render.com
- Replit
- AWS ECS
- Google Cloud Run
- Azure Container Instances

**Local testing:**

```bash
# Build Next.js
pnpm build

# Test production build locally
pnpm start
```

**Connecting to hosting:**

1. Create account on hosting platform
2. Connect your GitHub repository
3. Select Docker build option
4. Platform automatically detects and builds your app
5. Deploy with one click

**Environment variables:**

Set in platform's dashboard under environment variables:

```
NEXT_PUBLIC_ANALYTICS_ID=your_id
NODE_OPTIONS=-max-old-space-size=512
```

---

### Option 4: Traditional VPS/Cloud (AWS, DigitalOcean, Linode, etc.)

**Best for:** Full control, existing infrastructure, advanced features

**Setup time:** 30+ minutes

**Prerequisites:**

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 (process manager)
npm install -g pm2
```

**Deploy steps:**

```bash
# 1. Clone repository
git clone <your-repo-url>
cd my-project

# 2. Install dependencies
pnpm install

# 3. Build app
pnpm build

# 4. Start with PM2
pm2 start "npm start" --name "nextjs-app"

# 5. Save PM2 config
pm2 save

# 6. Configure PM2 to start on reboot
pm2 startup

# 7. View logs
pm2 logs nextjs-app
```

**Reverse proxy (Nginx):**

```nginx
# /etc/nginx/sites-available/my-project
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable and restart Nginx:**

```bash
sudo ln -s /etc/nginx/sites-available/my-project /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Environment Variables for All Platforms

### Create `.env.example`

```env
# Analytics (optional)
# NEXT_PUBLIC_ANALYTICS_ID=

# Node.js
NODE_ENV=production

# Server
PORT=3000
```

### Platform-specific setup:

**Vercel:**
- Dashboard → Settings → Environment Variables → Add

**Fly.io:**
```bash
flyctl secrets set VAR_NAME=value
```

**Docker platforms:**
- Dashboard → Environment Variables section

**VPS:**
```bash
# .env on server (never commit to git!)
NEXT_PUBLIC_ANALYTICS_ID=value
NODE_ENV=production
```

---

## Monitoring & Maintenance

### Vercel

- **Dashboard:** vercel.com/dashboard
- **Analytics:** Built-in performance monitoring
- **Logs:** Vercel → Deployments → Logs
- **Rollback:** One-click rollback to previous version

### Fly.io

```bash
# View logs
flyctl logs

# Monitor status
flyctl status

# View metrics
flyctl monitoring-dashboards

# SSH into instance for debugging
flyctl ssh console
```

### VPS

```bash
# View PM2 logs
pm2 logs nextjs-app

# Restart app
pm2 restart nextjs-app

# Stop app
pm2 stop nextjs-app

# Monitor resources
top
ps aux | grep node
```

---

## Troubleshooting

### Build failures

**Error: "Cannot find module X"**
```bash
pnpm install
pnpm build
```

**Error: "Command failed with exit code"**
- Check Node.js version (requires 20+)
- Check available disk space
- Check memory usage

### Runtime errors

**App crashes on startup**
```bash
# Test locally
pnpm build
pnpm start

# Check for console errors
# Fix errors before redeploying
```

**Memory issues**

Increase memory allocation:
- Vercel: Auto-scales, usually not needed
- Fly.io: `flyctl scale vm shared-cpu-2x --memory 512`
- VPS: Increase swap or upgrade instance
- Next.js: Add `NODE_OPTIONS=--max-old-space-size=1024` to env

### Performance issues

1. **Enable caching:**
   ```bash
   # Already done in next.config.mjs
   compress: true
   ```

2. **Use CDN:**
   - Vercel: Built-in
   - Fly.io: Configure regions
   - Others: Add Cloudflare in front

3. **Optimize images:**
   - Use `next/image` for optimization
   - Consider sharp for advanced optimization

---

## Cost Comparison

| Platform | Base | Compute | Storage | Total |
|----------|------|---------|---------|-------|
| **Vercel** | Free | $0 (included) | $0 (included) | ✅ Free |
| **Fly.io** | Free | ~$5-20/mo | Included | ✅ Cheap |
| **Railway** | Free | ~$7-20/mo | Included | ✅ Cheap |
| **Render** | Free | $7+ | Paid extra | ~$7+ |
| **AWS** | Free tier | ~$5-30/mo | ~$1-5/mo | ~$6-35 |
| **DigitalOcean** | Free tier | $6+ | Included | $6+ |

**Recommendation:** Start with Vercel (free), scale to Fly.io if needed.

---

## Deployment Checklist

Before deploying to production:

- [ ] Code committed to git
- [ ] No API keys in code (use env vars)
- [ ] `pnpm build` works locally
- [ ] `pnpm start` runs without errors
- [ ] Tests pass (if applicable)
- [ ] No console errors or warnings
- [ ] `.env.example` updated
- [ ] README.md is current
- [ ] Package.json scripts are correct
- [ ] Performance is acceptable
- [ ] Mobile responsive design tested

---

## Next Steps

1. **Choose your platform** (Vercel recommended for simplicity)
2. **Set up CD/CI** (automatic deployments on git push)
3. **Configure monitoring** (alerts for errors/downtime)
4. **Set up custom domain** (if using production)
5. **Enable HTTPS** (automatic on most platforms)
6. **Configure backups** (if needed)

**That's it! Your app is deployed.** 🚀
