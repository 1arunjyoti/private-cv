# AGENTS.md

PrivateCV: client-side-only resume builder (Next.js 16 App Router, TS strict, Tailwind v4, shadcn/ui, Dexie/IndexedDB, Zustand, @react-pdf/renderer). Privacy rule: user data never leaves the browser except to the AI provider the user configures.

## Commands

- Dev/prod builds force webpack: `npm run dev` / `npm run build` pass `--webpack` (Next 16 defaults to Turbopack otherwise).
- Typecheck has no script; run `npx tsc --noEmit`. Verify changes with lint -> tsc -> tests.
- `npm test` is Vitest watch mode in a TTY. Run once with `npx vitest run`, single file with `npx vitest run tests/lib/pdf-utils.test.ts`, filter by name with `-t "pattern"`.
- `npm run test:coverage` enforces thresholds (80% lines/functions/statements, 75% branches) and fails below them.

## Gotchas

- PWA: service worker files (`public/sw.js`, `public/workbox-*.js`) are generated into `public/` on every build (gitignored); PWA is disabled when `NODE_ENV=development`.
- PDF template fonts are fetched from jsDelivr CDN at runtime and registered in `lib/fonts.ts` (side-effect import in `lib/template-factory.tsx`). New font weights must be added there.
- All `NEXT_PUBLIC_*` env vars are optional feature flags (`NEXT_PUBLIC_ENABLE_CLOUD_SYNC`, `NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`). `.env.local` is gitignored; do not commit it.
- Stale docs: `plan.md` says static export (`output: 'export'`), but it's commented out in `next.config.ts` (dynamic OG images). `readme/AGENTS.MD` claims "no analytics/CSP configured" — Microsoft Clarity IS used, and no CSP exists (only a COOP header).

## Template system

Adding a template requires touching 3 files (see `docs/TEMPLATE_GUIDE.md`):
1. Theme in `TEMPLATE_THEMES` (`lib/theme-system.ts`)
2. Config + factory instance in `FACTORY_TEMPLATES` (`components/templates/FactoryTemplates.tsx`) — config `id` must match the theme key
3. Register id in `TemplateType` union and `TEMPLATES` array (`lib/constants.ts`)

Shared rendering lives in `lib/template-factory.tsx` (edit rarely) and section primitives in `components/templates/core/`.

## Data layer

- Schema types + Dexie tables are defined in `db/index.ts` (JSON-Resume-shaped `Resume`). Change schema there first; stores depend on it.
- `store/useResumeStore.ts` (Zustand + persist) orchestrates Dexie CRUD; sync logic is in `lib/sync/` (Google Drive BYOS, passphrase encryption in `crypto.ts`).
- Only server code: `app/api/parse-pdf` (rate-limited PDF text extraction) and `app/api/ollama` (proxy for local LLMs). Everything else is client components.

## Testing conventions

- `tests/setup.ts` runs `fake-indexeddb/auto` and replaces `global.fetch` with a hand-written mock of `/api/parse-pdf` — network is fully stubbed; msw is installed but unused.
- Build test data with factories from `@/tests/utils/factories.ts` (`createMockResume`, `createMockFile`), not inline objects.
- Real Google Drive integration test is opt-in: needs `RUN_GOOGLE_DRIVE_INTEGRATION=true` and `GOOGLE_DRIVE_SYNC_TEST_TOKEN`; skipped otherwise.
- Unit tests live next to sources or under `tests/**` mirroring source paths; component tests render via helpers in `@/tests/utils/render`.
- `tests/README.md` links to TESTING_*.md docs that live in gitignored `readme/`, not `docs/` — don't chase missing files in `docs/`.
