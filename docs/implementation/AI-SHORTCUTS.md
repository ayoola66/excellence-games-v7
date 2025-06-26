# AI Context Shortcuts

## Quick Reference

Use these shortcuts at the start of your prompts to automatically include specific contexts:

- `@rules` - Include all project rules and guidelines
- `@tdd` - Include TDD-specific rules
- `@db` - Include database-first approach rules
- `@ts` - Include TypeScript rules
- `@all` - Include ALL contexts (same as @rules)

## Examples

```
@rules How do I implement the game scoring feature?

@tdd I need to create a new component for the leaderboard

@db How should I structure the user achievements?

@ts What's the best way to type this API response?

@all Please review my implementation
```

## Shortcut Expansions

### @rules (or @all)
Expands to include:
- Development Guidelines
- AI Assistant Rules
- Project Structure
- Testing Requirements
- Database Approach
- TypeScript Standards
- British English Rules

### @tdd
Expands to include:
- TDD Workflow
- Testing Requirements
- Example Test Patterns
- Coverage Requirements

### @db
Expands to include:
- Database-First Approach
- Strapi Guidelines
- Data Management Rules
- API Structure

### @ts
Expands to include:
- TypeScript Configuration
- Type Definition Standards
- Error Handling Patterns
- Code Style Rules

## Usage Notes

1. Place shortcuts at the START of your message
2. You can combine shortcuts: `@tdd @db Please help with...`
3. Shortcuts are case-insensitive: `@TDD` = `@tdd`
4. `@all` is equivalent to using all shortcuts 