# 🚀 Vercel Deployment Setup

Complete guide for deploying The Vaughan Storyteller to Vercel with automatic GitHub integration.

## Prerequisites

- Vercel CLI installed (`npm i -g vercel`)
- GitHub repository connected
- Environment variables configured

## Quick Setup

### 1. Connect Repository

```bash
# Authenticate with Vercel (if not already done)
vercel login

# Connect project to Vercel
vercel link --yes
```

### 2. Configure Environment Variables

Add production environment variables to Vercel:

```bash
# Add Supabase configuration
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_STORAGE_BUCKET production

# Add OpenRouter API configuration
vercel env add OPENROUTER_API_KEY production
vercel env add OPENROUTER_BASE_URL production
vercel env add OPENROUTER_PRIMARY_MODEL production
vercel env add OPENROUTER_FALLBACK_MODEL production

# Verify configuration
vercel env ls
```

### 3. Deploy

```bash
# Deploy preview
vercel deploy

# Deploy to production
vercel --prod
```

## Configuration Files

### vercel.json

```json
{
  "version": 2,
  "regions": ["iad1"],
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist/spa",
  "installCommand": "npm ci",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api|_next|static|favicon.ico).*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### .vercelignore

```gitignore
# Dependencies
node_modules
npm-debug.log*

# Development files
.env.local
.env.development
.env.test

# Testing
test
coverage
cypress
cypress.config.ts
cypress.d.ts

# Documentation
docs
README.md
*.md

# Development tools
.vscode
.idea
*.log
.DS_Store

# Build artifacts (keep dist/spa for Vercel)
.quasar
dist/cordova
dist/capacitor
dist/electron
dist/bex
dist/ssr
dist/pwa

# Supabase local development
supabase/.temp
supabase/config.toml
supabase/backups

# MSW
public/mockServiceWorker.js
```

## GitHub Integration

### Automatic Deployments

- **Production**: Deploys automatically on push to `main` branch
- **Preview**: Creates preview deployment for all other branches
- **Pull Requests**: Adds preview URL as comment in PR

### Connect GitHub Repository

```bash
# Connect Git repository
vercel git connect

# Verify connection
vercel git ls
```

## Environment Variables

### Required Variables

All API keys are encrypted in Vercel:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key  
- `SUPABASE_STORAGE_BUCKET` - Storage bucket name
- `OPENROUTER_API_KEY` - OpenRouter API key
- `OPENROUTER_BASE_URL` - OpenRouter API base URL
- `OPENROUTER_PRIMARY_MODEL` - Primary AI model
- `OPENROUTER_FALLBACK_MODEL` - Fallback AI model

### Managing Variables

```bash
# Add variable to all environments
vercel env add VARIABLE_NAME

# Add to specific environment
vercel env add VARIABLE_NAME production

# Pull variables locally
vercel env pull .env.vercel

# List all variables
vercel env ls
```

## Security Features

### HTTP Security Headers

- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Controls browser features

### Performance Headers

- **Cache-Control**: Long-term caching for static assets
- **Immutable**: Prevents unnecessary revalidation

## Custom Domain Setup

### When Domain is Defined

1. **Add Domain in Vercel Dashboard**:
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Configure DNS**:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**:
   - Automatic via Let's Encrypt
   - Auto-renewal enabled

## Troubleshooting

### Build Failures

If build fails with TypeScript/ESLint errors:

1. **Check Local Build**:
   ```bash
   npm run build
   npm run lint
   npm run typecheck
   ```

2. **Common Issues**:
   - ESLint errors in generated types
   - Cypress configuration conflicts
   - Missing environment variables

### Deployment Issues

```bash
# Check deployment status
vercel list

# View deployment logs
vercel inspect [DEPLOYMENT_URL]

# Check project settings
vercel project ls
```

## Performance Optimization

### Current Configuration

- **Region**: `iad1` (US East - close to Supabase)
- **Build Time**: ~45 seconds
- **Deploy Time**: ~3 seconds
- **Bundle Splitting**: Enabled via Quasar
- **CDN**: Vercel Edge Network

### Metrics

- **Bundle Size**: ~591KB JS, ~256KB CSS
- **Cache**: Static assets cached for 1 year
- **Compression**: Automatic gzip/brotli

## Useful Commands

### Deployment

```bash
# List deployments
vercel list

# Deploy specific commit
vercel --prod --force

# Cancel deployment
vercel cancel [DEPLOYMENT_ID]
```

### Project Management

```bash
# Project info
vercel project ls

# Switch projects
vercel switch

# Remove project
vercel remove
```

## Next Steps

1. **Monitor Performance**: Set up analytics and monitoring
2. **Custom Domain**: Configure when domain is decided  
3. **Error Tracking**: Integrate Sentry for error monitoring
4. **Bundle Analysis**: Optimize bundle size
5. **Edge Functions**: Add API endpoints if needed

## Links

- **Production URL**: Latest deployment via `vercel list`
- **Dashboard**: [Vercel Project Dashboard](https://vercel.com)
- **GitHub Repository**: Auto-connected via `vercel git connect`

---

> **Note**: All sensitive information (API keys) is encrypted in Vercel. Never expose API keys in client-side code.