# Deployment Guides

Complete guides for deploying The Vaughan Storyteller to various platforms.

## Available Guides

### [Vercel Deployment](./vercel-setup.md)
Complete setup guide for deploying to Vercel with:
- GitHub integration and automatic deployments
- Environment variables configuration
- Security headers and performance optimization
- Custom domain setup (when ready)

## Quick Deploy

For immediate deployment to Vercel:

```bash
# Connect and deploy
vercel link --yes
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production  
vercel env add OPENROUTER_API_KEY production
vercel --prod
```

## Deployment Status

- ✅ **Vercel**: Production-ready with automatic deployments
- 🔄 **Custom Domain**: Pending domain definition
- 📋 **Environment**: All variables configured and encrypted

## Architecture

```
GitHub Repository
       ↓
   Push/PR Trigger  
       ↓
   Vercel Build
   (Quasar SPA)
       ↓  
   Global CDN Deploy
   (Edge Network)
       ↓
   Production URL
```

## Security

- All API keys encrypted in Vercel
- Security headers implemented
- HTTPS enforced via Let's Encrypt
- CORS configured for API endpoints

---

See individual guides for detailed setup instructions.