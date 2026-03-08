# Feature: Micro-course Generator

Read `00-master-roadmap.md`, `01-database-schema.md`, `06-gap-analysis.md` before implementing.
**Requires Features 01, 03, 04, 06.**

## Feature Description

On-demand AI micro-course generation for each competency gap. 15-30 minute courses with 3-5 steps (markdown content), practical exercises, 3+ free resource links, and a mini-project. Students can mark courses as completed, updating their Passport.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: `src/app/(dashboard)/micro-courses/`, `src/app/api/micro-courses/`
**Dependencies**: Features 01, 06 (gaps must exist)

---

## CONTEXT REFERENCES

### External Packages to Install

```bash
pnpm add react-markdown
```

**react-markdown docs**: https://github.com/remarkjs/react-markdown
Usage: `<ReactMarkdown>{step.content}</ReactMarkdown>`

### Files to Read Before Implementing

- `src/lib/db/schema.ts` — `microCourses` table: `id, studentId, gapId, competencyName, title, content (jsonb), completed, completedAt`
- `src/lib/ai/generate-why.ts` — AI generation pattern to follow
- `src/app/api/gaps/[id]/why/route.ts` — API pattern for AI generation
- `00-master-roadmap.md` — auth pattern

### Content Shape (jsonb `content` field)

```typescript
type MicroCourseContent = {
	estimatedMinutes: number; // 15-30
	steps: Array<{
		title: string;
		content: string; // markdown
		exercise?: string; // optional practical exercise (can do in browser)
	}>;
	resources: Array<{
		title: string;
		url: string;
		type: "video" | "article" | "interactive" | "docs";
	}>;
	project: {
		title: string;
		description: string; // markdown
		tools: string[]; // e.g. ["Google Colab", "CodePen"]
	};
};
```

### New Files to Create

- `src/app/(dashboard)/micro-courses/page.tsx` — courses list
- `src/app/(dashboard)/micro-courses/[id]/page.tsx` — single course view
- `src/app/api/micro-courses/route.ts` — GET list + POST generate
- `src/app/api/micro-courses/[id]/route.ts` — GET single + PATCH complete
- `src/components/micro-courses/course-list.tsx` — list with progress
- `src/components/micro-courses/course-view.tsx` — "use client" full course
- `src/components/micro-courses/step-accordion.tsx` — expandable steps
- `src/lib/ai/generate-micro-course.ts` — AI generation

---

## IMPLEMENTATION PLAN

### Phase 1: AI Generation

**`src/lib/ai/generate-micro-course.ts`**:

```typescript
export async function generateMicroCourse(
	competencyName: string,
	careerGoal: string,
	semester: number,
	relatedCompetencies: string[], // student's existing competencies for context
): Promise<MicroCourseContent> {
	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxTokens: 3000,
		prompt: `Jesteś ekspertem edukacji technicznej. Stwórz PRAKTYCZNY mikro-kurs dla studenta ${semester}. semestru, który chce zostać ${careerGoal}.

Temat kursu: ${competencyName}
Student już zna: ${relatedCompetencies.slice(0, 5).join(", ")}

Wymagania:
- 3-5 kroków (każdy max 200 słów, markdown)
- Każde ćwiczenie wykonywalne ONLINE (Google Colab, CodePen, repl.it, online IDE)
- 3-5 linków do DARMOWYCH, REALNYCH zasobów (YouTube, dokumentacja, Google Colab notebook)
- 1 mini-projekt wykonywalny online
- Czas: 15-30 minut łącznie
- Język: POLSKI

Zwróć TYLKO JSON (bez markdown code block):
{
  "estimatedMinutes": 20,
  "steps": [
    {
      "title": "Tytuł kroku",
      "content": "Treść w markdown...",
      "exercise": "Opcjonalne ćwiczenie praktyczne"
    }
  ],
  "resources": [
    {
      "title": "Nazwa zasobu",
      "url": "https://...",
      "type": "video"
    }
  ],
  "project": {
    "title": "Mini-projekt",
    "description": "Opis w markdown...",
    "tools": ["Google Colab"]
  }
}`,
	});

	const cleaned = text.trim().replace(/^```json?\n?/, "").replace(/\n?```$/, "");
	return JSON.parse(cleaned) as MicroCourseContent;
}
```

### Phase 2: API Endpoints

**`src/app/api/micro-courses/route.ts`**:
- GET: list all courses for student (with completion status)
- POST: generate new course for gapId
  - Check if course already exists for this gap → return existing
  - Call `generateMicroCourse()`
  - Save to DB
  - Return course

**`src/app/api/micro-courses/[id]/route.ts`**:
- GET: single course details
- PATCH `{ completed: true }`: mark as completed
  - Update `completed = true`, `completedAt = now()`
  - Update related competency status to `in_progress` (or `acquired` if was `missing`)
  - Recalculate passport `marketCoveragePercent`

### Phase 3: Course List Page

**`src/app/(dashboard)/micro-courses/page.tsx`** — server component:
- Checks if `?generate=[gapId]` query param → triggers generation
- Lists all existing courses with status

**`src/components/micro-courses/course-list.tsx`** — "use client":
- Overall progress bar: "X / Y kursów ukończonych"
- List of course cards: title + competency name + status badge + estimated time
- Link to `/micro-courses/[id]`
- Empty state: "Przejdź do Gap Analysis, żeby wygenerować pierwszy mikro-kurs"

### Phase 4: Course View

**`src/app/(dashboard)/micro-courses/[id]/page.tsx`** — server component

**`src/components/micro-courses/course-view.tsx`** — "use client":
```
┌─────────────────────────────────────┐
│ ← Powrót do kursów                  │
│ 📚 [Title]                          │
│ ⏱ ~20 minut                         │
│─────────────────────────────────────│
│ Kroki (accordion):                  │
│ [1. Intro ▼]                        │
│   Treść markdown + ćwiczenie        │
│ [2. Praktyka ▶]                     │
│ [3. Projekt ▶]                      │
│─────────────────────────────────────│
│ Zasoby:                             │
│ 🎥 Tytuł → link                     │
│ 📄 Tytuł → link                     │
│─────────────────────────────────────│
│ Mini-projekt:                       │
│ Opis (markdown)                     │
│ Narzędzia: Google Colab, CodePen    │
│─────────────────────────────────────│
│         [✓ Ukończ kurs]             │
└─────────────────────────────────────┘
```

**`src/components/micro-courses/step-accordion.tsx`**:
- Uses shadcn/ui approach or custom accordion
- First step open by default
- Each step: title + `<ReactMarkdown>` content + optional exercise

**"Ukończ kurs" button logic**:
1. PATCH `/api/micro-courses/[id]` with `{ completed: true }`
2. Show success toast: "Gratulacje! Kompetencja zaktualizowana w Paszporcie."
3. Update button state to "Ukończono ✓"

---

## STEP-BY-STEP TASKS

### TASK 1: INSTALL `react-markdown`
- **RUN**: `pnpm add react-markdown`
- **VALIDATE**: `pnpm build`

### TASK 2: CREATE `src/lib/ai/generate-micro-course.ts`
- **IMPLEMENT** full micro-course generation in Polish
- **IMPLEMENT** JSON parsing with code block stripping
- **GOTCHA**: Claude sometimes wraps JSON in ```json``` — always strip before parsing
- **VALIDATE**: `pnpm build`

### TASK 3: CREATE `src/app/api/micro-courses/route.ts`
- **IMPLEMENT** GET with auth + student lookup
- **IMPLEMENT** POST: check for existing course first (idempotent)
- **IMPLEMENT** call generateMicroCourse with student context
- **GOTCHA**: `export const maxDuration = 60;` — AI takes up to 30s
- **VALIDATE**: `pnpm build`

### TASK 4: CREATE `src/app/api/micro-courses/[id]/route.ts`
- **IMPLEMENT** GET single course
- **IMPLEMENT** PATCH `completed=true` + update competency status + recalculate passport coverage
- **VALIDATE**: `pnpm build`

### TASK 5: CREATE `src/components/micro-courses/step-accordion.tsx`
- **IMPLEMENT** accordion with first step open
- **IMPLEMENT** markdown rendering with `<ReactMarkdown>`
- **VALIDATE**: `pnpm build`

### TASK 6: CREATE `src/components/micro-courses/course-view.tsx`
- **IMPLEMENT** full course layout with steps + resources + project
- **IMPLEMENT** "Ukończ kurs" button with API call + toast
- **VALIDATE**: `pnpm build`

### TASK 7: CREATE `src/components/micro-courses/course-list.tsx`
- **IMPLEMENT** progress bar + list of course cards
- **IMPLEMENT** empty state
- **VALIDATE**: `pnpm build`

### TASK 8: CREATE `src/app/(dashboard)/micro-courses/page.tsx`
- **IMPLEMENT** server component with `?generate=[gapId]` handling
- **IMPLEMENT** if generate param: POST to API to trigger generation, then show course
- **VALIDATE**: `pnpm build`, navigate to `/micro-courses` in browser

### TASK 9: CREATE `src/app/(dashboard)/micro-courses/[id]/page.tsx`
- **IMPLEMENT** server component: fetch course from DB → render CourseView
- **VALIDATE**: navigate to a specific course

---

## VALIDATION COMMANDS

```bash
pnpm add react-markdown
pnpm build
pnpm lint
# Manual:
# 1. From Gap Analysis → click "Zamknij tę lukę"
# 2. Wait for course generation (<30s) with loading indicator
# 3. Verify course has 3-5 steps in Polish
# 4. Verify at least 3 resource links
# 5. Verify mini-project section
# 6. Click through accordion steps
# 7. Click "Ukończ kurs" → verify toast appears
# 8. Navigate to /micro-courses → verify completion status updated
# 9. Navigate to /passport → verify competency status changed
```

## ACCEPTANCE CRITERIA

- [ ] Course generation triggered from Gap Analysis
- [ ] Loading state shown during generation (<30s)
- [ ] Generated course has 3-5 steps in Polish
- [ ] Each step has title + markdown content
- [ ] At least 3 resource links per course
- [ ] Mini-project section present
- [ ] Steps in accordion, first step open
- [ ] Markdown renders correctly
- [ ] "Ukończ kurs" marks as complete
- [ ] Completion updates competency status in Passport
- [ ] Course list shows progress (X/Y completed)
- [ ] `pnpm build` passes
