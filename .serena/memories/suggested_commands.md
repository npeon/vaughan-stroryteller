# Suggested Commands for Development

## Daily Development Commands

### Development Server
- `npm run dev` or `quasar dev` - Start development server with hot reload
- `npm run build` or `quasar build` - Build for production

### Code Quality & Type Checking
- `npm run typecheck` - TypeScript type checking (vue-tsc --noEmit --skipLibCheck)
- `npm run lint` - ESLint checking
- `npm run format` - Prettier formatting

### Testing Commands
- `npm run test:unit` - Vitest unit tests
- `npm run test:unit:watch` - Vitest in watch mode
- `npm run test:unit:coverage` - Coverage report
- `npm run test:e2e` - Cypress E2E tests
- `npm run test:component` - Cypress component tests

### Package Management
- `npm install` - Install dependencies
- `npm run postinstall` - Quasar prepare (runs automatically)

### Essential Commands When Task is Completed
1. `npm run typecheck` - MANDATORY: Check TypeScript errors
2. `npm run lint` - MANDATORY: Check linting issues
3. `npm run test:unit:ci` - Run unit tests
4. `npm run format` - Format code

### Git Commands (Darwin/macOS)
- `git status` - Check working tree status
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit changes
- `git push` - Push to remote

### System Utilities (Darwin/macOS)
- `ls -la` - List files with details
- `find . -name "*.ts" -type f` - Find TypeScript files
- `grep -r "searchterm" src/` - Search in source files