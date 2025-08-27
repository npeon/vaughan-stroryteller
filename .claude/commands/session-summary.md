# Session Summary Generator

## Description

Genera automáticamente un resumen optimizado de la sesión actual en formato markdown dentro del directorio `claude_sessions/` con numeración incremental.

## Usage

```
/session-summary [título opcional]
```

## Examples

```
/session-summary
/session-summary implementacion-api-speechmatics
/session-summary correccion-bugs-audio
```

## Implementation

### Step 1: Detect next session number

- Read existing session files in `claude_sessions/`
- Find highest number (currently 0006)
- Calculate next number (0007, 0008, etc.)

### Step 2: Generate session summary

- Extract key technical details from conversation
- Identify main tasks and outcomes
- Create token-optimized content structure
- Focus on actionable information and code changes

### Step 3: Create session file

- Format: `[number]-[title].md` (e.g., `0007-session-summary.md`). Use a descriptive title and the number should be the next one after the highest existing one
- Include metadata: date, duration, status
- Organize content in sections:
  - Context and objectives
  - Technical implementation details
  - Files modified/created
  - Results and validation
  - Lessons learned

### Step 4: Token optimization strategies

- Use bullet points and structured format
- Include only essential code snippets
- Reference file paths with line numbers
- Summarize rather than transcribe full conversations
- Focus on technical decisions and outcomes

## Template Structure

```markdown
# Sesión [NUMBER] - [TITLE]

**Fecha**: [DATE]
**Duración**: [DURATION]
**Estado**: [STATUS]

## 📋 **Contexto Inicial**

[Summary of initial request and objectives]

## 🛠️ **Proceso de Implementación**

[Key implementation steps and technical decisions]

## ✅ **Resultados**

[Outcomes, files created/modified, verification steps]

## 💡 **Lecciones Técnicas**

[Key learnings and best practices]

## 📈 **Métricas de Éxito**

[Quantifiable results and improvements]
```

## Notes

- VERY IMPORTANT: Automatically saves to `[root proyect]/.claude/claude_sessions/` directory in root project
- Maintains chronological order with zero-padded numbering
- Optimizes content for future AI context loading
- Preserves critical technical details while minimizing tokens
