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

- [ ] Initialize Next.js project with Tailwind.
- [ ] Install and configure **shadcn/ui** components.
- [ ] Set up **Dexie.js** database schema for `resumes` and `settings`.
- [ ] Create `useResumeStore` connected to Dexie for async loading/saving.
- [ ] Configure PWA manifest and service workers (next-pwa).

### Phase 2: The Editor & Web Workers (Week 2)

- [ ] Build the Form components (Basics, Work, Education).
- [ ] Implement image upload handling (storing `Blob` directly to IndexedDB).
- [ ] **Technical Core:** Set up the PDF Generation Web Worker.
- [ ] Implement message passing system: `UI -> Worker (Data) -> UI (PDF Blob URL)`.

### Phase 3: Templates & ATS Compliance (Week 3)

- [ ] Implement **Template 1: "The ATS Scanner"** (Single column, standard headers, serif/sans-serif fonts).
- [ ] Implement **Template 2: "The Creative"** (Two columns, colors).
- [ ] Add "Job Description Matcher" (Simple client-side keyword highlighter).
- [ ] Implement Export (PDF) and Backup (JSON) features.

### Phase 4: Polish & Launch (Week 4)

- [ ] Add "Install App" PWA install flow.
- [ ] Add "Offline Mode" indicators.
- [ ] Set up **GitHub Actions** for automated deployment (CI/CD).
- [ ] Final performance audit (Lighthouse score 100).
- [ ] Unit tests for the Data Layer and Worker logic.

## 5. Directory Structure

```text
/root
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── editor/
├── components/
│   ├── forms/           # Input groups
│   ├── preview/         # PDF Worker Wrapper
│   └── templates/       # React-PDF Document definitions
├── db/
│   └── index.ts         # Dexie.js schema definition
├── workers/
│   └── pdf.worker.ts    # PDF Generation logic
├── store/
│   └── useStore.ts      # Zustand
└── utils/
    └── export.ts        # File saving helpers
```

## 6. Key Solutions & Strategies

### High-Performance PDF Rendering

Instead of rendering the PDF on the main thread (blocking interaction), we serialize the form data and send it to a Web Worker. The worker generates the PDF blob and posts it back. This keeps the UI responsive at 60fps even while generating complex documents.

### Unlimited Storage

By using IndexedDB (via Dexie.js), we bypass the 5MB LocalStorage limit. Users can store dozens of resumes with high-quality profile photos without hitting quota errors.

### ATS optimization

We provide dedicated "ATS Safe" templates that enforce:

- No columns / tables.
- Standard headings.
- Machine-readable fonts.

### Profile photo handling

Implement image upload functionality.

1. User selects an image from the file system (using the file input).
2. Image is compressed to a maximum of 500KB.
3. Image shows on the preview.
4. Image is attached to the downloaded resume file.

## Future features

- Photo background removal
- 
