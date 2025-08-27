# Code Style and Conventions

## TypeScript Conventions
- **Strict mode enabled** in tsconfig.json
- **Type safety first** - all functions and variables properly typed
- **Interface definitions** in `src/types/` directory
- **Defensive programming** - always handle undefined/null values

## Vue 3 Composition API
- Use `<script setup>` syntax with TypeScript
- **File structure order**:
  1. Imports
  2. Props/emits definitions
  3. Composables and reactive state
  4. Computed properties
  5. Methods
  6. Lifecycle hooks

## Naming Conventions
- **Variables**: camelCase (`userData`, `apiResponse`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MOCK_AUDIO_URLS`)
- **Components**: PascalCase (`UserProfile.vue`, `StoryCard.vue`)
- **Files**: kebab-case (`user-profile.vue`, `story-service.ts`)
- **Functions**: camelCase with descriptive names

## Code Formatting
- **Indentation**: 2 spaces (configured in .editorconfig)
- **Line endings**: LF
- **Semicolons**: Required
- **Quotes**: Single quotes preferred
- **Trailing commas**: Where valid

## Error Handling Patterns
- **Optional chaining**: `?.` for safe property access
- **Nullish coalescing**: `??` for default values
- **Type guards**: Explicit checks before operations
- **Fallback values**: Always provide safe defaults
- **Non-null assertions**: `!` only when guaranteed safe

## Testing Patterns
- **File naming**: `*.test.ts` for unit tests, `*.cy.ts` for Cypress
- **Test structure**: Arrange-Act-Assert pattern
- **Mocking**: MSW for API mocking
- **Coverage**: Target >80% for critical paths