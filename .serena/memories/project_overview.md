# The Vaughan Storyteller - Project Overview

## Project Purpose
The Vaughan Storyteller is a progressive web application (PWA) that uses artificial intelligence to generate personalized English stories adapted to the user's CEFR level (A1-C2). The application provides an immersive language learning experience through personalized narrative content.

## Key Features
- AI-powered story generation using OpenRouter API (Claude 3.5, GPT-4, Llama 3.1)
- Vocabulary management with spaced repetition system using WordsAPI
- Text-to-speech narration with ElevenLabs
- Admin panel for API health monitoring, user limits, and banner management
- PWA with offline functionality
- Cross-device synchronization via Supabase Realtime

## Tech Stack
- **Frontend**: Quasar Framework v2.16+ with Vue 3 Composition API + TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Hosting**: Vercel (with Edge Functions and preview deployments)
- **External APIs**: OpenRouter, ElevenLabs, WordsAPI
- **Cache/Rate Limiting**: Upstash Redis

## Development Environment
- Node.js with npm/pnpm
- TypeScript strict mode enabled
- ESLint + Prettier for code quality
- Vitest for unit testing
- Cypress for E2E testing