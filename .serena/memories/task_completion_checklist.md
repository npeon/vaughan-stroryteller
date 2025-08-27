# Task Completion Checklist

## MANDATORY Steps After Code Changes

### 1. Type Safety (CRITICAL)
```bash
npm run typecheck
```
- Must pass without errors
- Fix all TypeScript strict mode violations
- Use proper type annotations

### 2. Code Quality (REQUIRED)
```bash
npm run lint
```
- Fix all ESLint violations
- Ensure consistent code style
- No unused imports/variables

### 3. Code Formatting (REQUIRED)
```bash
npm run format
```
- Apply Prettier formatting
- Consistent indentation and spacing

### 4. Testing (RECOMMENDED)
```bash
npm run test:unit:ci
```
- Run unit tests
- Ensure no broken tests
- Add tests for new functionality

### 5. Build Verification (FOR MAJOR CHANGES)
```bash
npm run build
```
- Verify production build works
- Check for build warnings

## Quality Gates
- **TypeScript**: Zero errors in strict mode
- **ESLint**: Zero violations
- **Tests**: All passing
- **Build**: Successful production build

## Common Issues to Check
- **Unused imports** - Remove dead code
- **Type assertions** - Use safely with proper guards
- **Console statements** - Remove debug logs
- **Hardcoded values** - Use constants or environment variables
- **Error boundaries** - Proper error handling

## File Structure Validation
- New files in correct directories
- Proper naming conventions
- Export/import statements correct
- Dependencies properly declared