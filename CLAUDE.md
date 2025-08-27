# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Vaughan Storyteller** is a progressive web application (PWA) that uses artificial intelligence to generate personalized English stories adapted to the user's CEFR level (A1-C2). The application provides an immersive language learning experience through personalized narrative content.

### Key Features

- AI-powered story generation using OpenRouter API (Claude 3.5, GPT-4, Llama 3.1)
- Vocabulary management with spaced repetition system using WordsAPI
- Text-to-speech narration with ElevenLabs
- Admin panel for API health monitoring, user limits, and banner management
- PWA with offline functionality
- Cross-device synchronization via Supabase Realtime

## Architecture

### Tech Stack

- **Frontend**: Quasar Framework v2.16+ with Vue 3 Composition API + TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Hosting**: Vercel (with Edge Functions and preview deployments)
- **External APIs**: OpenRouter, ElevenLabs, WordsAPI
- **Cache/Rate Limiting**: Upstash Redis

### Directory Structure

```
src/
├── components/          # Vue components
│   ├── story/          # Story-related components
│   ├── vocabulary/     # Vocabulary management components
│   └── ui/            # Generic UI components
├── composables/        # Vue composables for reusable logic
├── stores/            # Pinia stores for state management
├── services/          # API services and business logic
│   ├── supabase/      # Supabase client and configuration
│   ├── openrouter/    # AI story generation integration
│   ├── elevenlabs/    # Text-to-speech service
│   └── wordsapi/      # Dictionary service integration
├── types/             # TypeScript type definitions
├── utils/             # Utilities and helpers
├── layouts/           # Page layouts
└── boot/              # Quasar boot files for configuration
```

## Common Development Commands

### Development

```bash
# Start development server (hot reload enabled)
npm run dev
# or
quasar dev

# Build for production
npm run build
# or
quasar build

# Type checking
npm run type-check

# Linting with ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Testing Commands (When Extensions Are Added)

The project is designed for TDD methodology but testing extensions need to be added:

```bash
# Add Quasar testing extensions (to be implemented)
quasar ext add @quasar/testing-unit-vitest
quasar ext add @quasar/testing-e2e-cypress

# Then these commands will be available:
npm run test:unit           # Vitest unit tests
npm run test:unit:watch     # Vitest in watch mode
npm run test:unit:coverage  # Coverage report
npm run test:e2e           # Cypress E2E tests
npm run test:component     # Cypress component tests
```

### Supabase Development (When Configured)

```bash
# Start local Supabase development
npx supabase start

# Reset database
npx supabase db reset

# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > src/types/supabase.ts

# Serve Edge Functions locally
npx supabase functions serve
```

## Development Patterns and Conventions

### Vue 3 Composition API

- Use `<script setup>` syntax with TypeScript
- Composables for reusable logic in `composables/` directory
- Pinia stores for state management
- Props/emits should be properly typed

### Code Style

- TypeScript strict mode enabled
- ESLint with Vue/TypeScript configuration
- Prettier for code formatting
- 2-space indentation
- Use arrow functions for methods

### Component Structure

Follow this order in Vue components:

```vue
<script setup lang="ts">
// 1. Imports
// 2. Props/emits definitions
// 3. Composables and reactive state
// 4. Computed properties
// 5. Methods
// 6. Lifecycle hooks
</script>

<template>
  <!-- Use data-testid attributes for testing -->
</template>
```

### API Integration Patterns

- All external API calls go through service classes in `services/`
- Use environment variables for API keys and configuration
- Implement rate limiting and error handling with fallback strategies
- Repository pattern for data persistence with Supabase

### Testing Strategy (TDD Approach)

- **Unit Tests (50%)**: Vitest for services, utilities, and composables
- **Component Tests (20%)**: Vue Test Utils with Quasar plugin
- **Integration Tests (20%)**: API integration and Supabase operations
- **E2E Tests (10%)**: Cypress for critical user flows

## Project-Specific Implementation Guidelines

### Story Generation System

- Use OpenRouter API with multiple model fallback (Claude 3.5 → GPT-4 → Llama 3.1)
- Stories must be adapted to CEFR levels (A1-C2)
- Implement vocabulary extraction and difficulty assessment
- Cache generated stories in Supabase Storage

### Vocabulary Management

- Integrate with WordsAPI for definitions, pronunciation, and etymology
- Implement spaced repetition algorithm for vocabulary review
- Track user progress and mastery levels in Supabase

### Admin Panel Features

- API health monitoring for OpenRouter, ElevenLabs, WordsAPI
- User story limits management (configurable per user)
- Banner management system (create/activate/deactivate ads)
- Only users with role='admin' can access admin features

### Authentication & Authorization

- Use Supabase Auth with OAuth providers
- Implement Row Level Security (RLS) policies
- Support user and admin roles
- Profile management with CEFR level selection

### PWA Implementation

- Service Worker with Workbox for caching strategies
- Offline functionality with IndexedDB for data storage
- Background sync when connection is restored
- Installable on mobile and desktop devices

## Important Configuration Details

### Quasar Configuration

- TypeScript strict mode enabled in `quasar.config.ts`
- Vue Router in hash mode for better compatibility
- ESLint integration with flat config
- Material Design icons and Roboto font included

### Environment Variables Required

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# External APIs
OPENROUTER_API_KEY=
ELEVENLABS_API_KEY=
WORDSAPI_API_KEY=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Application
SITE_URL=
```

## Specialized Agents Available

The project includes specialized agents in `.claude/agents/` for:

- **TDD Test Generator**: For creating comprehensive test suites
- **AI Integration Specialist**: For OpenRouter, ElevenLabs, WordsAPI integration
- **Backend Logic Advisor**: For Supabase and Edge Functions
- **Frontend Design Advisor**: For Vue/Quasar UI components
- **Education Platform Specialist**: For learning-focused features
- **Code Quality Auditor**: For code review and best practices
- **Documentation Researcher**: For technical documentation

**VERY IMPORTANT: Use these agents proactively** - they improve results and avoid contaminating the main thread with unnecessary context.

## Key Documentation References

- **Project Requirements**: `docs/prd/prd.md` (comprehensive PRD)
- **Implementation Plan**: `docs/prd/plan-implementacion.md` (TDD checklist with 440+ tasks)
- **Quasar Framework**: https://v2.quasar.dev/
- **Quasar testing**: https://testing.quasar.dev/
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Vue 3 Composition API**: https://vuejs.org/guide/

## Development Workflow

1. **Always start by reviewing**: `docs/prd/plan-implementacion.md` for task status and `docs/prd/prd.md` for context
2. **Follow TDD methodology**: Write tests first, then implement
3. **Use specialized agents**: Leverage the agents proactively for better results
4. **Check implementation status**: Mark completed tasks in the plan
5. **Maintain code quality**: Run lint/type-check before commits
6. **Test thoroughly**: Ensure >80% test coverage for critical paths

## Important Notes

- The project follows **Test-Driven Development (TDD)** methodology
- All features should be implemented with comprehensive test coverage
- External API integrations require proper error handling and fallbacks
- Admin panel features are restricted to users with admin role
- PWA functionality should work offline with proper synchronization
- Performance targets: <2s First Contentful Paint, <3s Time to Interactive, <500KB bundle size

For complex implementations, break down tasks into granular steps and use the TodoWrite tool to track progress systematically.
