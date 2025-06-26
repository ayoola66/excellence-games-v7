# Development Guidelines for Targeted Project

## Core Philosophy

Our development process follows strict Test-Driven Development (TDD) principles with a focus on behavior-driven testing and functional programming. All changes must maintain a working state and be backed by tests.

## Key Principles

- Write tests first (TDD)
- Test behavior, not implementation
- No `any` types or type assertions in TypeScript
- Use immutable data patterns
- Keep functions small and pure
- Maintain TypeScript strict mode
- Always use real schemas/types in tests

## Project-Specific Guidelines

### Data Management
- All data must be managed through Strapi backend - no local storage
- Database-first approach for all features
- Strapi server management:
  - Keep server running on port 1337 unless changes require restart
  - Document any server restarts in commit messages

### Code Organization

```
apps/
  frontend/     # Next.js application
    app/        # App router pages
    components/ # Reusable components
    lib/        # Utilities and helpers
  backend/      # Strapi application
    src/        # Backend source code
docs/           # Documentation
tests/          # E2E tests
scripts/        # Utility scripts
```

### Testing Requirements

1. **E2E Tests**:
   - All new features must have e2e tests
   - Use Playwright for e2e testing
   - Tests must verify business behavior

2. **Component Tests**:
   - Use React Testing Library
   - Focus on user interactions
   - No implementation details in tests

### TypeScript Guidelines

1. **Strict Mode Requirements**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

2. **Type Definitions**:
   - Prefer `type` over `interface`
   - Use explicit typing for clarity
   - Create domain-specific types

### State Management

1. **Server State**:
   - Use Strapi API for all data management
   - Implement proper error handling
   - Cache responses appropriately

2. **Client State**:
   - Use React Context for auth state
   - Keep UI state local to components
   - Avoid unnecessary global state

### Error Handling

```typescript
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// Example usage
const processGameResult = async (
  result: GameResult
): Promise<Result<ProcessedGame, GameError>> => {
  try {
    const processed = await processGame(result);
    return { success: true, data: processed };
  } catch (error) {
    return { 
      success: false, 
      error: new GameError("Failed to process game result")
    };
  }
};
```

### Code Style

1. **Naming Conventions**:
   - Use British English for all user-facing text
   - Follow camelCase for variables and functions
   - Use PascalCase for types and components

2. **File Organization**:
   - One component per file
   - Group related functionality in directories
   - Keep file sizes manageable

### Development Workflow

1. **Feature Development**:
   ```
   1. Write failing test
   2. Implement minimum code to pass
   3. Refactor if needed
   4. Update documentation
   ```

2. **Code Review Process**:
   - All changes must have tests
   - Documentation must be updated
   - Follow British English standards
   - Verify no local storage usage

### Security Considerations

1. **Authentication**:
   - Use proper token management
   - Implement rate limiting
   - Follow security best practices

2. **Data Protection**:
   - Validate all user input
   - Sanitize data before display
   - Use proper error boundaries

## Example Patterns

### Component Structure

```typescript
type GameCardProps = {
  game: Game;
  onPlay: (gameId: string) => void;
};

export const GameCard = ({ game, onPlay }: GameCardProps): JSX.Element => {
  const handlePlay = () => {
    onPlay(game.id);
  };

  return (
    <div className="game-card">
      <h3>{game.title}</h3>
      <button onClick={handlePlay}>
        Play Game
      </button>
    </div>
  );
};
```

### Testing Pattern

```typescript
describe("GameCard", () => {
  it("should trigger onPlay when play button clicked", async () => {
    const mockOnPlay = jest.fn();
    const mockGame = getMockGame();

    render(<GameCard game={mockGame} onPlay={mockOnPlay} />);
    
    const playButton = screen.getByRole("button", { name: /play game/i });
    await userEvent.click(playButton);

    expect(mockOnPlay).toHaveBeenCalledWith(mockGame.id);
  });
});
```

## Commit Guidelines

- Use conventional commits format
- Include test changes with features
- Document any Strapi server impacts
- Reference related issues/PRs

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Testing Library](https://testing-library.com/docs) 