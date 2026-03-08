# Feature: Gap Analysis

Read `00-master-roadmap.md`, `01-database-schema.md`, `04-dashboard-layout.md` before implementing.
**Requires Features 01, 03, 04.**

## Feature Description

Prioritized list of competency gaps with: priority badge (critical/important/nice-to-have), market demand percentage, estimated learning time, expandable "Dlaczego to ważne?" section (AI-generated), and "Zamknij tę lukę" button leading to micro-course generation.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: `src/app/(dashboard)/gap-analysis/`, `src/app/api/gaps/`
**Dependencies**: Features 01, 03 (gaps must exist in DB), 04 (layout)

---

## CONTEXT REFERENCES

### Files to Read Before Implementing

- `src/lib/db/schema.ts` — `gaps` table: `id, studentId, competencyName, priority, marketPercentage, estimatedHours, whyImportant`
- `src/app/(dashboard)/dashboard/page.tsx` — server component pattern
- `src/components/ui/card.tsx`, `button.tsx`, `separator.tsx`
- `00-master-roadmap.md` — auth pattern, AI generation pattern

### New Files to Create

- `src/app/(dashboard)/gap-analysis/page.tsx` — server component
- `src/app/api/gaps/route.ts` — GET all gaps for student
- `src/app/api/gaps/[id]/why/route.ts` — POST: generate "why important" text
- `src/components/gap-analysis/gap-list.tsx` — "use client" list with expandable items
- `src/components/gap-analysis/gap-card.tsx` — single gap card
- `src/lib/ai/generate-why.ts` — AI "why important" generation

### Priority Visual Design

| Priority | Badge color | Sort order |
|----------|-------------|-----------|
| critical | red | 1st |
| important | yellow/amber | 2nd |
| nice_to_have | gray/blue | 3rd |

Polish labels: `critical` → "Krytyczna", `important` → "Ważna", `nice_to_have` → "Warto znać"

---

## IMPLEMENTATION PLAN

### Phase 1: API Endpoints

**`src/app/api/gaps/route.ts`** (GET):
```typescript
// Auth → get student → get gaps ordered by priority (critical first)
// Return: { gaps: Gap[] }
// Order: critical → important → nice_to_have, then by marketPercentage DESC
```

**`src/app/api/gaps/[id]/why/route.ts`** (POST):
```typescript
// Auth → verify gap belongs to student → check if whyImportant already exists
// If exists: return cached value
// If not: call generateWhy() → update gap.whyImportant in DB → return
export const maxDuration = 30;
```

### Phase 2: AI "Why Important" Generation

**`src/lib/ai/generate-why.ts`**:
```typescript
export async function generateWhyImportant(
	competencyName: string,
	careerGoal: string,
	marketPercentage: number,
): Promise<string> {
	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxTokens: 400,
		prompt: `Jesteś doradcą kariery dla studentów w Polsce.

Napisz KRÓTKIE wyjaśnienie (150-250 słów) dlaczego umiejętność "${competencyName}" jest ważna dla osoby, która chce zostać ${careerGoal}.

Wymagania wymagane przez ${marketPercentage}% ofert pracy.

Uwzględnij:
- 3 konkretne zawody/role, w których ta umiejętność jest używana
- 2-3 konkretne zadania w pracy, gdzie ta umiejętność pomaga
- Orientacyjne widełki płacowe w Polsce (brutto, miesięcznie)

Pisz po polsku, bezpośrednio do studenta (forma "Ty"). Bez wstępów.`,
	});
	return text.trim();
}
```

### Phase 3: Gap Card Component

**`src/components/gap-analysis/gap-card.tsx`** — "use client":

```
┌────────────────────────────────────────────┐
│ [KRYTYCZNA] Python                   78%   │
│ ⏱ Szac. czas: 10h                          │
│                                            │
│ [Dlaczego to ważne? ▼]                     │
│ (expandable section — loads on first open) │
│                                            │
│                    [Zamknij tę lukę →]     │
└────────────────────────────────────────────┘
```

- Priority badge with color
- Competency name (bold)
- Market percentage (right-aligned)
- Estimated hours
- Collapsible "Dlaczego to ważne?" — fetches from API on first expand (lazy load)
- "Zamknij tę lukę" button → links to `/micro-courses?generate=[id]`

### Phase 4: Gap List + Page

**`src/components/gap-analysis/gap-list.tsx`** — "use client":
- Receives `gaps` array from server
- Renders GapCards
- Shows empty state: "Gratulacje! Twój profil pokrywa wymagania rynku."
- Shows skeleton while loading

**`src/app/(dashboard)/gap-analysis/page.tsx`** — server component:
- Auth check
- Fetch student + gaps from DB (sorted: critical first, then by marketPercentage DESC)
- Pass to GapList

---

## STEP-BY-STEP TASKS

### TASK 1: CREATE `src/lib/ai/generate-why.ts`
- **IMPLEMENT** Polish-language "why important" generation
- **IMPLEMENT** 150-250 word output with professions + salary range
- **VALIDATE**: `pnpm build`

### TASK 2: CREATE `src/app/api/gaps/route.ts`
- **IMPLEMENT** GET with auth + student lookup
- **IMPLEMENT** sort: critical first, then by marketPercentage DESC
- **VALIDATE**: `curl -X GET http://localhost:3000/api/gaps`

### TASK 3: CREATE `src/app/api/gaps/[id]/why/route.ts`
- **IMPLEMENT** POST with auth + gap ownership check
- **IMPLEMENT** check if `gap.whyImportant` already exists (cache)
- **IMPLEMENT** generate + save + return
- **VALIDATE**: `pnpm build`

### TASK 4: CREATE `src/components/gap-analysis/gap-card.tsx`
- **IMPLEMENT** collapsible "Dlaczego to ważne?" with fetch on first open
- **IMPLEMENT** loading spinner while fetching explanation
- **IMPLEMENT** "Zamknij tę lukę" link: `/micro-courses?generate=[gapId]`
- **GOTCHA**: Use `useState(false)` for expanded state, fetch on first expand only
- **VALIDATE**: `pnpm build`

### TASK 5: CREATE `src/components/gap-analysis/gap-list.tsx`
- **IMPLEMENT** renders list of GapCards
- **IMPLEMENT** empty state message
- **IMPLEMENT** loading skeleton (3 placeholder cards)
- **VALIDATE**: `pnpm build`

### TASK 6: CREATE `src/app/(dashboard)/gap-analysis/page.tsx`
- **IMPLEMENT** server component with auth + sorted gaps fetch
- **IMPLEMENT** pass gaps to GapList client component
- **VALIDATE**: `pnpm build`, open `/gap-analysis` in browser

---

## VALIDATION COMMANDS

```bash
pnpm build
pnpm lint
# Manual:
# 1. After onboarding → navigate to /gap-analysis
# 2. Verify gaps are sorted: critical → important → nice_to_have
# 3. Expand "Dlaczego to ważne?" — should load AI text
# 4. Verify text is in Polish, 150-250 words
# 5. Click "Zamknij tę lukę" — should go to /micro-courses?generate=[id]
# 6. Verify empty state message when no gaps
```

## ACCEPTANCE CRITERIA

- [ ] Gaps listed sorted by priority (critical first)
- [ ] Each gap shows: name, priority badge, market %, estimated hours
- [ ] Priority badges colored correctly (red/amber/gray)
- [ ] "Dlaczego to ważne?" expands and loads AI text (Polish, 150-250 words)
- [ ] "Zamknij tę lukę" button navigates to micro-courses
- [ ] Loading skeleton shown while data loads
- [ ] Empty state shown when no gaps
- [ ] AI response cached (second expand = no API call)
- [ ] `pnpm build` passes
