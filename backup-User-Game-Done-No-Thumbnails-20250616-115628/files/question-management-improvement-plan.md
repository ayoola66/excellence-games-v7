# Question & Game Management Reliability Plan  
*(Draft – please review and confirm before implementation)*

## 1. Objectives

1. Ensure **seamless upload / import** of questions (CSV for straight games, XLSX for nested games)
2. Guarantee **full CRUD reliability** for:
   - Games (straight & nested)
   - Categories / Cards
   - Individual Questions & Options
3. Maintain **database integrity** on PostgreSQL and flawless syncing with both Admin & User dashboards
4. **Zero visual changes** – preserve all existing styling / UX
5. Provide **tests & logging hooks** for quick future diagnosis

---

## 2. Current Pain-Points (observed)

| Area | Symptom | Probable Cause |
|------|---------|----------------|
| Import (nested) | XLSX upload occasionally stalls / partial write | Large payload; controller timeout; missing sheet validation |
| Import (straight) | CSV rows silently skipped | Weak row-level validation & early exit on first error |
| Question Edit | Option updates not reflected until hard refresh | Frontend cache not invalidated; missing `await` in update call |
| Category CRUD | Card renaming breaks dice → card mapping | Category `cardNumber` not re-synced after rename |
| Admin ↔ User sync | New games visible in admin but 404 in user route for ~1 min | Stale SWR cache & missing `revalidatePath` on creation |
| **Thumbnail upload** | Game/category thumbnails sometimes do not display or 404 | Wrong media URL transform; missing `populate=thumbnail`; local file provider returning relative path |

---

## 3. Proposed Work-Plan

### 3.1 Backend (Strapi)
1. **Schema audit**
   - Verify `question`, `category`, `game` content-types match brief (difficulty removed, cardNumber present, relations correct)
   - **Ensure thumbnail media field** is `required: false`, `multiple: false`, and included in `populate` defaults
2. **Controller hardening**
   - Custom **`import-questions` service**
     - XLSX parser (`xlsx` package) → sheet → row validation → batch create via `entityService.createMany` (where supported) otherwise chunked loop
     - CSV parser (`fast-csv`)
     - Clear transaction & rollback on any validation failure
   - Add `PATCH /questions/:id/options` for quick option edits
3. **Validation layer**
   - Strapi `content-type` validations + additional JOI schema inside controller for imports
4. **PostgreSQL performance tweaks**
   - Add indexes (`gameId`, `categoryId`) if absent
   - **Image handling** – confirm media table indices and clean orphan files
5. **Unit tests** (Jest + Strapi test utils) for import / CRUD endpoints

### 3.2 Frontend (Next.js)
1. **API hooks**
   - Wrap question & category mutations with **SWR mutate** to auto-refresh related queries
2. **Import UX**
   - Progress bar (chunk upload) & post-import summary (rows processed / failed) – **modal only, no layout change**
   - **Thumbnail preview** after upload with fallback placeholder if fetch fails
3. **Editing flows**
   - Inline option edit in Question modal with optimistic UI
   - **Game thumbnail replace** option in Game modal (drag-and-drop)
4. **Error handling / toasts**
   - Display specific validation errors returned from backend
   - **Detect and warn** if thumbnail upload exceeds 2 MB limit or returns 4xx/5xx

### 3.3 Admin Dashboard Enhancements (logic-only)
1. **Nested Game safety checks**
   - Prevent card rename if dice mapping would break ➜ confirmation modal
2. **Bulk delete safeguards**
   - Double-confirm before deleting Categories containing questions

### 3.4 Testing & Verification
1. **Seed scripts** – ensure fresh DB can be populated with demo games & questions
2. **Playwright E2E** flows:
   - Admin imports 125 Qs → User plays game → Correct question distribution
3. **Load test** – 1k question import within 30 s

---

## 4. Deliverables
1. Updated Strapi controllers & routes (no breaking changes)
2. Frontend API helpers + SWR cache updates
3. Jest unit tests & Playwright E2E script
4. Documentation update (README & `/docs/import-guide.md`)
5. **Backup instruction** – timestamped DB dump before migration

---

## 5. Timeline (once approved)
| Day | Task |
|-----|------|
| **1** | Schema audit, backup, create test DB |
| **2** | Backend controller refactor + validation layer |
| **3** | Frontend API & admin modal tweaks |
| **4** | Unit & E2E tests + load test |
| **5** | UAT with client sample files, bug fixes, final hand-off |

---

## 6. Open Questions
1. Should card 6 (special) be completely question-less or allow future bonus questions? This is questionless so it shouldn't be added to the category. However, if it is selected in the gameplay, the user playing can then pick any of the other card 1-5 to answer the category question or do perform an action from the baord game already prepared.
2. Max expected CSV/XLSX size for import (rows)? This shoould not have a limit, please. However, for any reason, if its going to help the coding and database to be ready, please 1000 rows at a time.
3. Require multi-language question support in near term? No, not now. However, if there is a way to add this hiding for  future use, then yes. If not, don't add it, when we get there in the roadmap, we will add it.

---

**Please review this plan and confirm or request changes before I proceed with implementation.** 