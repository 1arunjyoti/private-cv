# Project Plan: SecureCV.app

A high-performance, **Progressive Web App (PWA)** for building professional resumes. All processing, data storage, and PDF generation occur strictly on the client side, ensuring complete user privacy (Zero-Knowledge Architecture).

## 1. Project Overview

- **Framework:** Next.js (App Router)
- **Primary Goal:** Provide a premium resume-building experience without compromising user privacy.
- **Deployment:** Static Site Export (output: 'export') deployed as a PWA.
- **Data Policy:** "Zero-Knowledge" — the developer has no access to user data.
- **Offline Capability:** Fully functional offline after initial load.

## 2. Technical Architecture

### Core Stack

- **State Management:** Zustand (UI state) + **Dexie.js (IndexedDB)** for persistent data storage.
  - _Why IndexedDB?_ To store high-res images and unlimited resume versions without the 5MB localStorage limit.
- **PDF Generation:** `@react-pdf/renderer` running inside a **Web Worker**.
  - _Why Web Workers?_ To prevent UI freezing during complex PDF rendering operations.
- **Styling:** Tailwind CSS + **shadcn/ui** (Radix Primitives) for accessible, premium components.
- **Validation:** Zod (for validating imported JSON data).
- **Testing:** Vitest + React Testing Library.
- **Icons:** Lucide-React.

### Pages & Routing

- **/ (Home):** Landing page with "Install App" prompt (PWA) and value proposition.
- **/templates:** Gallery of ATS-friendly and creative layouts.
- **/editor:** The main workspace.
- **/dashboard:** (New) Manage multiple resumes and versions.

## 3. Data Model (The Resume Schema)

Standardized JSON structure compliant with JSON Resume (where possible) but adapted for internal needs:

```json
{
  "id": "uuid-v4",
  "meta": {
    "title": "Software Engineer Resume",
    "templateId": "minimalist-ats",
    "themeColor": "#3b82f6",
    "lastModified": "2023-10-27T10:00:00Z"
  },
  "basics": {
    "name": "",
    "label": "",
    "image": "blob:...", // Stored as Blob in IndexedDB
    "email": "",
    "phone": "",
    "url": "",
    "summary": "",
    "location": { "city": "", "country": "" },
    "profiles": []
  },
  "work": [],
  "education": [],
  "skills": [],
  "projects": []
}
```

## 4. Development Roadmap

### Phase 1: Foundation & Storage (Week 1)

- [x] Initialize Next.js project with Tailwind.
- [x] Install and configure **shadcn/ui** components.
- [x] Set up **Dexie.js** database schema for `resumes` and `settings`.
- [x] Create `useResumeStore` connected to Dexie for async loading/saving.
- [x] Configure PWA manifest and service workers (next-pwa).

### Phase 2: The Editor & Web Workers (Week 2)

- [x] Build the Form components (Basics, Work, Education).
- [x] Implement image upload handling (storing `Blob` directly to IndexedDB).
- [x] **Technical Core:** Set up the PDF Generation Web Worker.
- [x] Implement message passing system: `UI -> Worker (Data) -> UI (PDF Blob URL)`.

### Phase 3: Templates & ATS Compliance (Week 3)

- [x] Implement **Template 1: "The ATS Scanner"** (Single column, standard headers, serif/sans-serif fonts).
- [x] Implement **Template 2: "The Creative"** (Two columns, colors).
- [x] Add "Job Description Matcher" (Simple client-side keyword highlighter).
- [x] Implement Export (PDF) and Backup (JSON) features.

### Phase 4: Polish & Launch (Week 4)

- [x] Add "Install App" PWA install flow.
- [x] Add "Offline Mode" indicators.
- [ ] Set up **GitHub Actions** for automated deployment (CI/CD).
- [ ] Final performance audit (Lighthouse score 100).
- [x] Unit tests for the Data Layer and Worker logic.

### Profile photo handling

- [x] Implement image upload functionality.
- [x] User selects an image from the file system (using the file input).
- [x] Image is compressed to a maximum of 500KB.
- [x] Image shows on the preview.
- [x] Image is attached to the downloaded resume file.

## Additional Completed Features

- [x] Multiple resume templates (Classic, Modern, Minimal, Professional, Creative, Executive, Tech, Elegant, Bold, Compact)
- [x] Design customization (colors, fonts, spacing, section visibility)
- [x] ATS Score analyzer with keyword matching
- [x] Import functionality (PDF, DOCX, JSON formats)
- [x] Export to PDF and DOCX formats
- [x] Rich text editor for experience highlights
- [x] Drag-and-drop section reordering
- [x] Dark mode support
- [x] Responsive design for mobile/tablet/desktop

## Future features

- [x] Photo background removal
- [x] Header background color customizer
- [x] Reorder sections between columns
- [ ] PDF import improvements (better text extraction for external PDFs)
- [ ] Multi-language support
- [x] Resume analytics dashboard
- [x] User-Owned Cloud Sync (Bringer-Your-Own-Storage)
