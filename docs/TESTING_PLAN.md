# Comprehensive Testing Plan - Resume Builder

## Executive Summary

This document outlines a comprehensive testing strategy for the resume-builder application, covering unit tests, integration tests, and end-to-end tests. The plan prioritizes critical functionality, edge cases, and ensures robust test coverage across all application layers.

## Current Test Coverage Status

### ✅ Already Tested
- Store: `useResumeStore.test.ts` - State management
- Utilities: `ats-score.test.ts` - ATS scoring logic
- Utilities: `text-processing.test.ts` - Text processing & keyword extraction
- Database: `db/index.test.ts` - Database operations

### 🎯 Testing Goals
- **Target Coverage**: 80%+ overall code coverage
- **Critical Path Coverage**: 100% for core resume operations
- **Component Testing**: All user-facing components
- **Integration Testing**: API routes, database operations, file parsing
- **E2E Testing**: Complete user workflows

---

## 1. Unit Tests

### 1.1 Database Layer (`db/`)

#### `db/index.test.ts` - EXPAND EXISTING
**Priority**: HIGH

**Test Cases**:
- ✅ Basic CRUD operations (existing)
- [ ] **Edge Cases**:
  - Concurrent resume updates
  - Large batch operations (100+ resumes)
  - Database corruption recovery
  - Migration scenarios
  - Duplicate ID handling
  - Invalid data type insertions
  - Transaction rollbacks
  - Storage quota exceeded scenarios

**New Tests**:
```typescript
describe('Database Edge Cases', () => {
  it('should handle concurrent updates without data loss', async () => {
    // Test race conditions
  });
  
  it('should prevent duplicate IDs', async () => {
    // Test unique constraint
  });
  
  it('should handle storage quota exceeded', async () => {
    // Test quota limits
  });
  
  it('should validate data schemas', async () => {
    // Test invalid data rejection
  });
});
```

---

### 1.2 Utility Functions (`lib/`)

#### `lib/pdf-utils.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- PDF to JPG conversion with various scales
- Download functionality
- Large PDF files (50+ pages)
- Corrupted PDF handling
- Empty PDF documents
- PDFs with images vs text-only
- Memory management for large conversions
- Concurrent conversion requests

#### `lib/image-utils.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- Image validation (size, format, dimensions)
- Base64 encoding/decoding
- Invalid image formats
- Oversized images (>5MB)
- Corrupted image data
- Empty/null file handling
- SVG handling
- Animated GIFs

#### `lib/docx-generator.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- Document generation with complete resume data
- Markdown parsing (bold, italic, underline, links)
- Special characters and sanitization
- Empty sections handling
- Unicode characters
- Very long text content
- Color scheme application
- Layout settings variations
- Invalid XML character removal

#### `lib/template-utils.test.ts` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Date formatting (various formats, invalid dates)
- MM to PT conversion accuracy
- Level score calculation
- Section title capitalization (lowercase, uppercase, title case)
- Edge cases: empty strings, null values
- Leap years, timezone handling

#### `lib/template-factory.test.tsx` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Template selection for all supported IDs
- Invalid template ID handling
- Props passing to templates
- Template rendering with missing data
- All template types render without errors

#### `lib/theme-system.test.ts` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Deep merge functionality
- Theme composition
- Compiled theme retrieval
- Invalid theme config handling
- Theme inheritance
- Color validation
- Layout settings merging

---

### 1.3 Import Parsers (`lib/import/`)

#### `lib/import/pdf-parser.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- Parse valid resume PDFs
- Extract sections (work, education, skills)
- Handle scanned PDFs (image-based)
- Multi-page PDFs
- PDFs with tables
- PDFs with special formatting
- Empty PDFs
- Password-protected PDFs
- Corrupted PDF files
- Various PDF versions

#### `lib/import/docx-parser.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- Parse valid DOCX files
- Extract formatted text
- Handle tables in DOCX
- Handle embedded images
- Corrupted DOCX files
- Old DOC format handling
- Very large DOCX files
- Empty documents
- Documents with macros

#### `lib/import/parse-utils.test.ts` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Email extraction from text
- Phone number extraction (various formats)
- URL extraction
- Date parsing (multiple formats)
- Name extraction
- Section detection
- Edge cases: malformed data

---

### 1.4 Component Unit Tests (`components/`)

#### `components/editor/ATSScore.test.tsx` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Score calculation display
- Score category rendering (Excellent, Good, Fair, Poor)
- Empty resume handling
- Score breakdown display
- Props validation

#### `components/forms/*.test.tsx` - NEW (ALL FORMS)
**Priority**: HIGH

**Test Cases for Each Form**:
- Field rendering
- Validation (required fields, email, phone, URLs)
- Form submission
- Add/Remove dynamic entries
- Data persistence
- Error states
- Loading states
- Empty form initialization
- Maximum field length validation

**Forms to Test**:
- `BasicsForm` - Email, phone, URL validation
- `WorkForm` - Date ranges, company validation
- `EducationForm` - Date ranges, score formats
- `SkillsForm` - Keyword handling
- `ProjectsForm` - URL validation, dates
- `CertificatesForm` - Date validation
- `LanguagesForm` - Fluency levels
- `InterestsForm` - Keyword arrays
- `PublicationsForm` - Date and URL validation
- `ReferencesForm` - Contact info validation
- `AwardsForm` - Date validation
- `CustomForm` - Dynamic field handling

#### `components/preview/PDFPreview.test.tsx` - NEW
**Priority**: HIGH

**Test Cases**:
- PDF rendering
- Loading states
- Error states
- Empty resume handling
- Template switching
- Zoom functionality
- Multi-page rendering

#### `components/preview/PDFImageViewer.test.tsx` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Image loading
- Navigation between pages
- Download functionality
- Error handling
- Loading states

#### `components/ImportDialog.test.tsx` - NEW
**Priority**: HIGH

**Test Cases**:
- File selection
- File type validation
- Upload progress
- Success/error states
- Cancel operation
- Multiple file handling

#### `components/ImportReview.test.tsx` - NEW
**Priority**: HIGH

**Test Cases**:
- Display parsed data
- Edit parsed fields
- Confirm import
- Cancel import
- Data validation

#### `components/JobMatcher.test.tsx` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Job description input
- Keyword matching
- Match score calculation
- Suggestions display
- Empty input handling

#### `components/DesignSettings.test.tsx` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Color picker
- Font size adjustment
- Line height adjustment
- Spacing controls
- Template selection
- Settings persistence

---

## 2. Integration Tests

### 2.1 API Routes (`app/api/`)

#### `app/api/parse-pdf/route.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- Valid PDF upload and parsing
- Invalid file type rejection
- File size limits
- Timeout handling
- Scanned PDF detection
- Multi-page PDF processing
- Rate limiting
- Concurrent requests
- Error responses (400, 500)
- Success responses (200)

**Example Test Structure**:
```typescript
describe('POST /api/parse-pdf', () => {
  it('should parse valid PDF and return text', async () => {
    const formData = new FormData();
    formData.append('file', mockPdfFile);
    
    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.text).toBeDefined();
  });
  
  it('should reject non-PDF files', async () => {
    // Test file validation
  });
  
  it('should handle scanned PDFs', async () => {
    // Test scanned PDF detection
  });
});
```

---

### 2.2 Store Integration (`store/`)

#### `store/useResumeStore.integration.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- Load resume from database
- Save resume to database
- Update resume and persist
- Delete resume
- List all resumes
- Handle concurrent operations
- Error recovery
- Optimistic updates
- Rollback on failure

---

### 2.3 Database + Store Integration

#### `integration/database-store.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- Create resume via store → verify in DB
- Update resume via store → verify persistence
- Delete resume via store → verify removal
- Load resumes on app init
- Handle database errors in store
- Data consistency between store and DB

---

### 2.4 Import Workflow Integration

#### `integration/import-workflow.test.ts` - NEW
**Priority**: HIGH

**Test Cases**:
- Upload PDF → Parse → Review → Import → Save
- Upload DOCX → Parse → Review → Import → Save
- Cancel during parsing
- Cancel during review
- Error during parsing
- Error during save
- Partial data import
- Merge with existing resume

---

### 2.5 Export Workflow Integration

#### `integration/export-workflow.test.ts` - NEW
**Priority**: MEDIUM

**Test Cases**:
- Generate PDF from resume
- Generate DOCX from resume
- Generate JPG previews
- Download generated files
- Handle large resumes
- Handle special characters
- Multiple export formats simultaneously

---

## 3. Component Integration Tests

### 3.1 Editor Workflow

#### `integration/editor-workflow.test.tsx` - NEW
**Priority**: HIGH

**Test Cases**:
- Load resume in editor
- Edit multiple sections
- Auto-save functionality
- Preview updates in real-time
- Template switching
- Design settings application
- ATS score recalculation
- Undo/redo (if implemented)

---

### 3.2 Template Rendering

#### `integration/template-rendering.test.tsx` - NEW
**Priority**: HIGH

**Test Cases**:
- Render each template with full data
- Render each template with minimal data
- Render each template with empty sections
- Template switching
- Custom sections rendering
- Theme application
- Layout settings application

---

## 4. Edge Cases & Error Scenarios

### 4.1 Data Validation Edge Cases

**Priority**: HIGH

**Test Cases**:
- XSS attack vectors in text fields
- SQL injection attempts (even though using IndexedDB)
- Extremely long text inputs (>10,000 chars)
- Special characters (emoji, unicode, RTL text)
- Null/undefined in required fields
- Malformed dates
- Invalid URLs
- Invalid email formats
- Invalid phone formats

### 4.2 Performance Edge Cases

**Priority**: MEDIUM

**Test Cases**:
- Resume with 50+ work experiences
- Resume with 100+ skills
- Very large profile images (>5MB)
- Generating 100+ page PDF
- Rapid template switching
- Rapid form input (stress test)
- Memory leaks in long sessions

### 4.3 Browser Compatibility

**Priority**: MEDIUM

**Test Cases**:
- IndexedDB support
- PDF.js compatibility
- Canvas support for image generation
- Local storage limits
- Service worker functionality
- PWA installation

### 4.4 Network & Offline Scenarios

**Priority**: MEDIUM

**Test Cases**:
- Offline mode functionality
- Network error handling
- Retry mechanisms
- Data synchronization after reconnect
- Cache management

---

## 5. End-to-End Tests (Future Consideration)

### 5.1 Critical User Journeys

**Priority**: LOW (Implement after unit/integration tests)

**Test Scenarios**:
1. **New User Journey**:
   - Visit app → Create new resume → Fill all sections → Preview → Download PDF

2. **Import Journey**:
   - Upload existing resume → Review parsed data → Edit → Save → Export

3. **Template Journey**:
   - Create resume → Try all templates → Customize design → Download

4. **Mobile Journey**:
   - Access on mobile → Edit resume → Preview → Share

**Tools**: Playwright or Cypress

---

## 6. Test Implementation Priority

### Phase 1: Critical Path (Week 1-2)
- [ ] Database edge cases
- [ ] PDF parser tests
- [ ] DOCX parser tests
- [ ] API route tests
- [ ] Store integration tests
- [ ] Form validation tests

### Phase 2: Core Features (Week 3-4)
- [ ] All form component tests
- [ ] PDF/DOCX generation tests
- [ ] Import workflow integration
- [ ] Export workflow integration
- [ ] Template rendering tests

### Phase 3: Polish & Edge Cases (Week 5-6)
- [ ] Image utilities tests
- [ ] Theme system tests
- [ ] Performance tests
- [ ] Security tests (XSS, injection)
- [ ] Browser compatibility tests

### Phase 4: E2E (Week 7+)
- [ ] Critical user journey tests
- [ ] Mobile tests
- [ ] PWA tests

---

## 7. Testing Infrastructure

### 7.1 Test Utilities Needed

Create `tests/utils/` directory with:

```typescript
// tests/utils/factories.ts
export const createMockResume = (overrides?: Partial<Resume>): Resume => {
  // Factory for resume test data
};

export const createMockFile = (type: 'pdf' | 'docx', size?: number): File => {
  // Factory for file uploads
};

// tests/utils/render.tsx
export const renderWithProviders = (component: React.ReactElement) => {
  // Wrapper for testing components with context
};

// tests/utils/db-helpers.ts
export const clearTestDatabase = async () => {
  // Clean up test database
};

export const seedTestData = async (resumes: Resume[]) => {
  // Seed test data
};
```

### 7.2 Mock Data

Create `tests/mocks/` directory with:
- `mockResumes.ts` - Various resume fixtures
- `mockFiles.ts` - Mock PDF/DOCX files
- `mockApiResponses.ts` - API response fixtures

### 7.3 Test Configuration

Update `vitest.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/',
        '.next/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        'vitest.config.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### 7.4 Additional Dependencies

Add to `package.json`:
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@vitest/coverage-v8": "^4.0.17",
    "msw": "^2.0.0",
    "@faker-js/faker": "^8.3.1"
  }
}
```

---

## 8. Test Naming Conventions

```typescript
// Unit Test Pattern
describe('ComponentName/FunctionName', () => {
  describe('specificMethod', () => {
    it('should do X when Y happens', () => {
      // Test implementation
    });
    
    it('should throw error when invalid input', () => {
      // Edge case
    });
  });
});

// Integration Test Pattern
describe('Feature Integration', () => {
  it('should complete full workflow: step1 → step2 → step3', () => {
    // Integration test
  });
});
```

---

## 9. Coverage Goals

### Target Coverage Metrics
- **Overall**: 80%+
- **Critical Paths**: 100%
  - Database operations
  - File parsing
  - Resume generation
  - Data validation
- **Components**: 85%+
- **Utilities**: 90%+
- **API Routes**: 100%

### Coverage Reports
- Run `npm run test:coverage` after each phase
- Review HTML coverage report
- Identify gaps and prioritize

---

## 10. Continuous Testing Strategy

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test -- --run --changed"
    }
  }
}
```

### CI/CD Integration
- Run full test suite on PR
- Block merge if tests fail
- Generate coverage reports
- Track coverage trends

---

## 11. Success Metrics

- [ ] All critical paths have 100% coverage
- [ ] No known bugs in tested code
- [ ] Tests run in <30 seconds (unit tests)
- [ ] Tests run in <2 minutes (integration tests)
- [ ] Test suite catches regressions
- [ ] Documentation for all test utilities

---

## Appendix: Test Examples

### Example: Form Component Test
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasicsForm } from '@/components/forms/BasicsForm';

describe('BasicsForm', () => {
  it('should render all fields', () => {
    render(<BasicsForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
  
  it('should validate email format', async () => {
    render(<BasicsForm />);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
  
  it('should accept valid email', async () => {
    render(<BasicsForm />);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.blur(emailInput);
    
    expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
  });
});
```

### Example: Integration Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db';
import { useResumeStore } from '@/store/useResumeStore';

describe('Database-Store Integration', () => {
  beforeEach(async () => {
    await db.resumes.clear();
    useResumeStore.getState().reset();
  });
  
  it('should create resume in store and persist to database', async () => {
    const store = useResumeStore.getState();
    const mockResume = createMockResume();
    
    await store.saveResume(mockResume);
    
    // Verify in store
    expect(store.currentResume).toEqual(mockResume);
    
    // Verify in database
    const dbResume = await db.resumes.get(mockResume.id);
    expect(dbResume).toEqual(mockResume);
  });
});
```

---

## Conclusion

This comprehensive testing plan ensures robust coverage of all critical paths, edge cases, and user workflows. Implementation should follow the phased approach, prioritizing critical functionality first, then expanding to comprehensive coverage.

**Next Steps**:
1. Review and approve this plan
2. Set up test infrastructure (utilities, mocks, config)
3. Begin Phase 1 implementation
4. Regular coverage reviews after each phase
5. Iterate based on findings

**Questions or modifications**: Please provide feedback on priorities or specific test scenarios to add/remove.
