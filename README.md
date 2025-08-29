# The Vaughan Storyteller (quasar-story-telling)

Pequeñas historias en ingés para fortalecer tu inglés y ampliar vocabulario

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Type checking

```bash
npm run typecheck
```

### Testing

#### Unit Tests (Vitest)
```bash
# Run unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:ui

# Run unit tests for CI (single run)
npm run test:unit:ci
```

#### End-to-End Tests (Cypress)
```bash
# Open Cypress E2E tests in interactive mode
npm run test:e2e

# Run E2E tests for CI (headless)
npm run test:e2e:ci
```

#### Component Tests (Cypress)
```bash
# Open Cypress component tests in interactive mode
npm run test:component

# Run component tests for CI (headless)
npm run test:component:ci
```

### Build the app for production

```bash
quasar build
```

### Vercel Deployment

The project is configured for automatic deployment to Vercel:

```bash
# Quick deploy to production
vercel --prod

# List current deployments
vercel list

# Pull environment variables locally
vercel env pull .env.vercel
```

**Production URL**: https://quasar-vaughan-storyteller-6l301kgbq-nachos-projects-14dbc22f.vercel.app

**Required Environment Variables**:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENROUTER_API_KEY` - OpenRouter API key for AI story generation

For detailed deployment setup, see [Deployment Guide](./docs/progressive-docs/how-to-guides/deployment/vercel-setup.md).

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
