# Tests Directory

This directory contains test utilities, mock data, and integration tests for the resume-builder project.

## Structure

```
tests/
├── README.md                      # This file
├── setup.ts                       # Global test configuration
├── utils/                         # Test utilities
│   ├── factories.ts              # Generate test data
│   ├── render.tsx                # Component testing helpers
│   └── db-helpers.ts             # Database testing helpers
├── mocks/                         # Pre-built mock data
│   └── mockResumes.ts            # Sample resume data
└── integration/                   # Integration tests
    └── import-workflow.test.ts   # Import workflow tests
```

## Quick Start

### Running Tests

```bash
# All tests (watch mode)
npm test

# All tests (run once)
npm test -- --run

# With coverage
npm run test:coverage

# With UI
npm run test:ui

# Specific test file
npm test template-utils
```

### Writing a Test

1. Create a test file next to your source file (for unit tests)
2. Or create in `tests/integration/` (for integration tests)
3. Import utilities from `@/tests/utils/`
4. Write your test using the patterns in the documentation

**Example**:

```typescript
// lib/my-function.test.ts
import { describe, it, expect } from 'vitest';
import { createMockResume } from '@/tests/utils/factories';
import { myFunction } from './my-function';

describe('myFunction', () => {
  it('should process resume correctly', () => {
    const resume = createMockResume();
    const result = myFunction(resume);
    expect(result).toBeDefined();
  });
});
```

## Test Utilities

### Factories (`utils/factories.ts`)

Generate test data easily:

```typescript
import { 
  createMockResume, 
  createMinimalResume,
  createMockFile 
} from '@/tests/utils/factories';

// Full resume with all data
const resume = createMockResume();

// Minimal resume
const minimal = createMinimalResume();

// With custom data
const custom = createMockResume({
  basics: { name: 'Custom Name' }
});

// Mock file upload
const file = createMockFile('pdf', 5000);
```

### Database Helpers (`utils/db-helpers.ts`)

Manage test database:

```typescript
import { 
  setupTestDatabase,
  teardownTestDatabase,
  getResumeById 
} from '@/tests/utils/db-helpers';

beforeEach(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await teardownTestDatabase();
});
```

### Component Rendering (`utils/render.tsx`)

Test React components:

```typescript
import { render, screen } from '@/tests/utils/render';

it('should render component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Mock Data (`mocks/mockResumes.ts`)

Pre-built test data:

```typescript
import { 
  mockStandardResume,
  mockCompleteResume 
} from '@/tests/mocks/mockResumes';

// Use directly
const resume = mockStandardResume;
```

## Common Patterns

### Unit Test

```typescript
describe('Component/Function Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Component Test

```typescript
import { render, screen, fireEvent } from '@/tests/utils/render';

it('should handle user interaction', () => {
  render(<MyComponent />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Integration Test

```typescript
import { setupTestDatabase } from '@/tests/utils/db-helpers';

beforeEach(async () => {
  await setupTestDatabase();
});

it('should complete workflow', async () => {
  // Test multiple steps together
});
```

### Async Test

```typescript
it('should handle async operation', async () => {
  const result = await myAsyncFunction();
  expect(result).toBeDefined();
});
```

### Error Test

```typescript
it('should throw error', () => {
  expect(() => myFunction('invalid')).toThrow();
});
```

## Best Practices

1. **Clean up after tests**
   ```typescript
   afterEach(async () => {
     await teardownTestDatabase();
   });
   ```

2. **Use descriptive names**
   ```typescript
   it('should validate email format') // ✅
   it('test1')                        // ❌
   ```

3. **One assertion per test** (when possible)
   ```typescript
   it('should format date', () => {
     expect(formatDate('2023-01-01')).toBe('Jan 2023');
   });
   ```

4. **Test edge cases**
   - Empty strings
   - Null/undefined
   - Very large values
   - Invalid inputs

5. **Use factories for test data**
   ```typescript
   const resume = createMockResume(); // ✅
   const resume = { id: '1', ... };    // ❌
   ```

## Documentation

For more information:
- **Full Strategy**: `docs/TESTING_PLAN.md`
- **Quick Start**: `docs/TESTING_QUICKSTART.md`
- **Checklist**: `docs/TESTING_CHECKLIST.md`
- **Summary**: `docs/TESTING_SUMMARY.md`

## Coverage

View coverage report:
```bash
npm run test:coverage
start coverage/index.html  # Windows
```

Target: 80%+ overall coverage

## Debugging

### In VS Code
1. Add breakpoint in test
2. Click "Debug" above test
3. Step through code

### Isolate Tests
```typescript
it.only('run only this test', () => {});
it.skip('skip this test', () => {});
```

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure tests pass
3. Check coverage
4. Document any new patterns

## Questions?

See the documentation in `docs/` or ask the team!
