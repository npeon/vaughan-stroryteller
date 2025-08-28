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
- Always review: `docs/prd/prd.md` (comprehensive PRD) and `docs/prd/plan-implementacion.md` (implementation plan) when starting a new session to get context
- VERY IMPORTANT: Use your agents proactively

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
quasar dev (best use this)

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

### Testing Commands (Fully Configured)

The project has comprehensive TDD testing setup with Vitest + Cypress:

```bash
# Unit Tests (Vitest)
npm run test:unit           # Run unit tests
npm run test:unit:ui        # Run with Vitest UI
npm run test:unit:ci        # Single run for CI
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm run test:coverage:ci    # Coverage for CI

# End-to-End Tests (Cypress)
npm run test:e2e           # Interactive E2E tests
npm run test:e2e:ci        # Headless E2E for CI
npm run test:component     # Interactive component tests
npm run test:component:ci  # Headless component tests

# TDD Workflows
npm run test:tdd           # Combined watch mode (tests + typecheck)
npm run dev:tdd            # Combined dev server + test watch
npm run test:all           # Full test suite (typecheck + lint + coverage + e2e)
npm run test:quick         # Quick validation (typecheck + unit tests)
npm run test:debug         # Debug mode with inspector
```

### Supabase Development (Fully Configured)

The database schema is implemented with 4 migrations and comprehensive TypeScript types:

```bash
# Start local Supabase development
npx supabase start

# Reset database and apply all migrations
npx supabase db reset

# Create new migration
npx supabase migration new migration_name

# Apply migrations to remote
npx supabase db push

# Generate TypeScript types (already implemented in src/types/supabase.ts)
npx supabase gen types typescript --local > src/types/supabase.ts

# Serve Edge Functions locally
npx supabase functions serve

# Check migration status
npx supabase status
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

### Design Guidelines

**Design System Reference**: Follow the design patterns and aesthetics from **Quasar Prime Admin**

- **Documentation**: https://quasar-prime-admin-documentation.netlify.app/
- **Live Demo**: https://quasar-prime-admin-template.netlify.app/
- **Login Example**: https://quasar-prime-admin-template.netlify.app/login_cover

#### **Design Principles**
- **Clean and Modern**: Prioritize minimalist aesthetics with purposeful white space
- **Professional UI**: Business-grade interface suitable for educational applications
- **Consistent Spacing**: Follow Quasar's spacing system with consistent margins/padding
- **Typography Hierarchy**: Clear visual hierarchy with appropriate font weights and sizes
- **Color Harmony**: Use Quasar Prime's color palette for consistency

#### **Component Design Standards**
- **Forms**: Clean input fields with proper labels, validation states, and helpful feedback
- **Cards**: Use elevation and border radius consistently for content containers
- **Buttons**: Follow Primary/Secondary/Outline button patterns from Quasar Prime
- **Navigation**: Clean sidebar and header navigation following Prime Admin patterns
- **Tables**: Well-structured data tables with proper spacing and hover states
- **Modals/Dialogs**: Consistent modal designs with proper backdrop and positioning

#### **Layout Patterns**
- **Authentication Pages**: Follow the `login_cover` pattern for clean, centered forms with branding
- **Dashboard**: Use card-based layouts with proper grid systems and spacing
- **Content Pages**: Consistent page headers, breadcrumbs, and content organization
- **Responsive Design**: Mobile-first approach ensuring all components work on various screen sizes

#### **Visual Elements**
- **Icons**: Use Material Design icons consistently throughout the application
- **Loading States**: Implement skeleton loaders and progress indicators appropriately
- **Empty States**: Design meaningful empty states with actionable guidance
- **Error States**: Clear error messaging with helpful recovery options

**Important**: Always reference the Quasar Prime Admin examples when implementing new UI components to maintain design consistency and professional appearance.

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

### UI/UX Design Implementation

**Current Authentication System**: Follow Quasar Prime Admin login patterns for consistency

The implemented email/password authentication system should be enhanced to match the **login_cover** pattern:

#### **Authentication Pages Design**
```vue
<!-- Reference: https://quasar-prime-admin-template.netlify.app/login_cover -->
<template>
  <!-- Clean centered layout with brand positioning -->
  <div class="auth-container">
    <!-- Left/Right split design with gradient backgrounds -->
    <div class="auth-content">
      <!-- Branding section with logo and tagline -->
      <div class="brand-section">
        <div class="logo">The Vaughan Storyteller</div>
        <div class="tagline">AI-Powered English Learning</div>
      </div>
      
      <!-- Forms section with clean card design -->
      <div class="form-section">
        <q-card class="auth-card">
          <!-- Tab navigation following Prime patterns -->
          <q-tabs class="prime-tabs">
            <!-- Clean, minimal tab design -->
          </q-tabs>
          
          <!-- Form fields with Prime styling -->
          <q-input 
            class="prime-input"
            outlined
            :rules="validationRules"
            :error="hasError"
          />
          
          <!-- Primary action buttons -->
          <q-btn 
            class="prime-btn primary full-width"
            unelevated
            size="lg"
          />
        </q-card>
      </div>
    </div>
  </div>
</template>
```

#### **Design Enhancement Priorities**
1. **Layout Structure**: Implement split-screen design from login_cover example
2. **Typography**: Use Quasar Prime typography scale for consistent text hierarchy  
3. **Form Styling**: Enhance input fields, buttons, and validation states
4. **Color Scheme**: Apply Prime color palette for professional appearance
5. **Spacing**: Follow Prime spacing system for consistent margins/padding
6. **Responsive Behavior**: Ensure mobile-first responsive design

#### **Component Libraries to Reference**
- **Forms**: Prime form validation patterns with error states
- **Cards**: Prime card elevation and shadow patterns
- **Buttons**: Prime button variants (primary, secondary, outline)
- **Typography**: Prime text classes and font weights

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

## Database Architecture (Implemented)

### Supabase Schema Overview

The database consists of 4 sequential migrations with 9 tables implementing a comprehensive learning platform:

**Core Tables:**

- `profiles`: User profiles with CEFR levels, statistics, and role-based access
- `stories`: AI-generated stories with metadata (genre, difficulty, audio, progress)
- `vocabulary_words`: Spaced repetition system with SM-2 algorithm integration
- `story_progress`: Detailed reading tracking with bookmarks and time spent

**Admin Tables:**

- `ad_banners`: Banner management system with targeting and analytics
- `user_limits`: Configurable user quotas for stories and audio generation
- `api_health_checks`: Real-time monitoring of external API services
- `usage_analytics`: Comprehensive event tracking for user behavior

**System Tables:**

- `system_config`: Global configuration key-value store

**Key Features Implemented:**

- Row Level Security (RLS) policies for data isolation
- 25+ performance indexes for optimal queries
- 15+ triggers for automated data consistency
- 4 optimized views for complex data aggregation
- Comprehensive TypeScript types in `src/types/supabase.ts`

## Important Configuration Details

### Quasar Configuration

- TypeScript strict mode enabled in `quasar.config.ts`
- Vue Router in hash mode for better compatibility
- ESLint integration with flat config (flat config format)
- Material Design icons and Roboto font included
- Vite plugin checker for real-time TypeScript and ESLint validation
- Supabase boot file configured for authentication

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

### Design System References

- **Quasar Prime Admin Documentation**: https://quasar-prime-admin-documentation.netlify.app/
- **Quasar Prime Live Demo**: https://quasar-prime-admin-template.netlify.app/
- **Login Design Reference**: https://quasar-prime-admin-template.netlify.app/login_cover
- **Component Examples**: Browse the live demo for consistent UI patterns and styling

### MSW (Mock Service Worker) Configuration

The project includes comprehensive API mocking for development and testing:

- **Mock Data**: Pre-configured mock responses in `src/mocks/data/`
- **API Handlers**: Mock implementations for OpenRouter, ElevenLabs, WordsAPI in `src/mocks/handlers/`
- **Browser Setup**: MSW browser worker configured in `public/` directory
- **Node Setup**: Server-side mocking for Node.js testing environment

## Development Workflow

1. **Always start by reviewing**: `docs/prd/plan-implementacion.md` for task status and `docs/prd/prd.md` for context
2. **Follow TDD methodology**: Write tests first, then implement (comprehensive testing setup available)
3. **Use specialized agents**: Leverage the agents proactively for better results
4. **Database-first development**: Schema and types are implemented - build upon the existing database structure
5. **Check implementation status**: Mark completed tasks in the plan (Tasks 0.9-0.12 completed)
6. **Maintain code quality**: Run `npm run pre-commit` which includes lint/type-check/unit tests
7. **Test thoroughly**: Use `npm run test:all` for full validation before major commits

## Important Notes

- **Database Schema Implemented**: 4 complete migrations with 9 tables, RLS policies, and comprehensive TypeScript types
- **Testing Infrastructure Ready**: Vitest + Cypress fully configured with MSW mocking
- **TDD Methodology**: Write tests first using the existing testing infrastructure
- **Type Safety**: Strict TypeScript mode with comprehensive database types in `src/types/supabase.ts`
- **Current Implementation Status**: Database foundation complete (Tasks 0.9-0.12), ready for service layer development
- **External API Integration**: Comprehensive mock implementations available for development/testing
- **Performance Targets**: <2s First Contentful Paint, <3s Time to Interactive, <500KB bundle size
- **Quality Gates**: Use `npm run pre-commit` to validate code quality before commits

### Next Development Phase

The database foundation is complete. Next logical steps from the implementation plan:

- Task 0.13: Supabase Auth configuration
- Task 0.14: Supabase Storage setup
- Task 0.15+: External API service implementations

For complex implementations, break down tasks into granular steps and use the TodoWrite tool to track progress systematically.
