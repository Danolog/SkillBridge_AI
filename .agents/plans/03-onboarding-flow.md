# Feature: Onboarding Flow + Syllabus Parser

Read `00-master-roadmap.md` and `01-database-schema.md` before implementing. **Requires Feature 01 (DB Schema) to be completed first.**

## Feature Description

3-step onboarding form for new students:
1. Personal info (name pre-filled from auth, university dropdown, field of study, semester, career goal)
2. Syllabus input (textarea paste OR PDF upload, max 10MB)
3. AI-parsed competency review (editable list before saving)

After confirmation → creates student record + competencies in DB + triggers Skill Map and Gap Analysis generation in background → redirect to `/dashboard`.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: `src/app/(dashboard)/onboarding/`, `src/app/api/`, `src/lib/ai/`
**Dependencies**: Feature 01 (DB Schema), Better Auth session

---

## CONTEXT REFERENCES

### Files to Read Before Implementing

- `src/lib/db/schema.ts` — `students`, `competencies` tables (after Feature 01)
- `src/lib/auth/server.ts` — `auth` instance for session check
- `src/lib/auth/client.ts` — `authClient` for client-side session
- `src/components/auth/signup-form.tsx` — form pattern with useState + fetch
- `src/components/ui/button.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `card.tsx`
- `00-master-roadmap.md` — AI generation pattern, Drizzle query pattern

### New Files to Create

- `src/app/(dashboard)/onboarding/page.tsx` — server wrapper (auth check)
- `src/components/onboarding/onboarding-wizard.tsx` — "use client" 3-step form
- `src/components/onboarding/step-profile.tsx` — step 1
- `src/components/onboarding/step-syllabus.tsx` — step 2
- `src/components/onboarding/step-competencies.tsx` — step 3
- `src/app/api/syllabus/parse/route.ts` — AI parsing endpoint
- `src/app/api/onboarding/route.ts` — save student + competencies
- `src/lib/ai/parse-syllabus.ts` — AI parsing logic
- `src/lib/ai/generate-skill-map.ts` — post-onboarding skill map generation
- `src/lib/ai/generate-gaps.ts` — post-onboarding gap analysis generation

### Merito Universities (for dropdown)
```
WSB Merito Gdańsk, WSB Merito Gdynia, WSB Merito Wrocław, WSB Merito Poznań,
WSB Merito Warszawa, WSB Merito Bydgoszcz, WSB Merito Toruń, WSB Merito Łódź,
WSB Merito Szczecin, WSB Merito Opole, WSB Merito Chorzów, WSB Merito Kraków,
WSB Merito Rzeszów, WSB Merito Lublin
```

### Career Goals (for dropdown)
```
Data Analyst, Data Scientist, Frontend Developer, Backend Developer,
Full-stack Developer, UX/UI Designer, Project Manager,
DevOps Engineer, Cybersecurity Analyst, Inne (wpisz)
```

---

## IMPLEMENTATION PLAN

### Phase 1: Route Setup and Auth Protection

`src/app/(dashboard)/onboarding/page.tsx` — server component:
```typescript
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { students } from "@/lib/db/schema";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	// If already onboarded, redirect to dashboard
	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (student?.onboardingCompleted) redirect("/dashboard");

	return <OnboardingWizard user={session.user} />;
}
```

### Phase 2: 3-Step Wizard Component

`src/components/onboarding/onboarding-wizard.tsx` — "use client":
- State: `step` (1|2|3), `profileData`, `syllabusText`, `competencies` (array of `{id: string, name: string}`)
- Progress bar at top (1/3 → 2/3 → 3/3)
- Renders: `<StepProfile>` | `<StepSyllabus>` | `<StepCompetencies>`
- On step 3 "Zatwierdź": POST to `/api/onboarding` → redirect `/dashboard`

**StepProfile** (step 1):
- Fields: university (select), fieldOfStudy (text input), semester (select 1-10), careerGoal (select + custom input if "Inne")
- Note: name is already in `user` from auth — no need to collect again
- Validation: all fields required, semester 1-10

**StepSyllabus** (step 2):
- Textarea for paste (min 100 chars for validation)
- File input for PDF upload (accept=".pdf", max 10MB)
- "Analizuj sylabus" button → POST to `/api/syllabus/parse`
- Loading state: skeleton + "Analizujemy Twój sylabus — to może potrwać do 30 sekund…"
- Error handling: timeout (60s), invalid file type, empty input

**StepCompetencies** (step 3):
- Editable list of competencies from AI response
- Each item: text input + delete button
- "Dodaj kompetencję" button at bottom
- "Zatwierdź i utwórz Paszport" button

### Phase 3: API Endpoints

**`src/app/api/syllabus/parse/route.ts`** (POST):
```typescript
// Input: { syllabusText: string } or multipart form with PDF file
// Output: { competencies: Array<{ id: string, name: string }> }
// Auth required
// Calls src/lib/ai/parse-syllabus.ts
// 60s timeout: export const maxDuration = 60;
```

**`src/app/api/onboarding/route.ts`** (POST):
```typescript
// Input: { university, fieldOfStudy, semester, careerGoal, syllabusText, competencies: string[] }
// Output: { success: true, studentId: string }
// Auth required
// Creates/updates student record
// Creates competency records
// Creates passport record (with random UUID)
// Triggers background skill map + gap generation (fire-and-forget with setTimeout or separate call)
```

### Phase 4: AI Parsing Logic

**`src/lib/ai/parse-syllabus.ts`**:
```typescript
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function parseSyllabus(syllabusText: string, careerGoal: string): Promise<string[]> {
	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxTokens: 2000,
		prompt: `Jesteś ekspertem od analizy programów studiów i wymagań rynku pracy w Polsce.

Przeanalizuj poniższy sylabus i wyciągnij listę konkretnych kompetencji, umiejętności i technologii, których student się uczy.

Student chce zostać: ${careerGoal}

Sylabus:
${syllabusText.slice(0, 8000)}

Zwróć TYLKO tablicę JSON z kompetencjami w formacie:
["Python", "SQL", "Analiza danych", ...]

Wymagania:
- 15-40 kompetencji
- Konkretne nazwy (nie ogólniki)
- Mix technicznych i miękkich kompetencji
- Tylko JSON array, bez żadnego innego tekstu`,
	});

	try {
		const cleaned = text.trim().replace(/^```json?\n?/, "").replace(/\n?```$/, "");
		return JSON.parse(cleaned) as string[];
	} catch {
		throw new Error("Failed to parse AI response");
	}
}
```

### Phase 5: Post-onboarding AI Generation (background)

After saving student data, fire-and-forget calls to generate skill map and gaps.

**`src/lib/ai/generate-skill-map.ts`**:
```typescript
// Takes student competencies + job market data for career goal
// Returns React Flow nodes and edges
// Nodes: { id, data: { label, status }, position, type: 'skillNode' }
// Edges: { id, source, target }
// Saves result to skill_maps table
```

**`src/lib/ai/generate-gaps.ts`**:
```typescript
// Takes student competencies + job market data for career goal
// Compares and generates gaps with priority + marketPercentage + estimatedHours
// Saves to gaps table
// Also updates competencies.status and marketPercentage
```

**Prompt for gap generation**:
```
Given student competencies: [list]
Job market requirements for [career goal]: [market data from DB]
Identify gaps and classify as critical (>60% demand), important (40-60%), nice_to_have (<40%).
Return JSON: { gaps: [{name, priority, marketPercentage, estimatedHours}], competencyUpdates: [{name, status, marketPercentage}] }
```

---

## STEP-BY-STEP TASKS

### TASK 1: CREATE `src/lib/ai/parse-syllabus.ts`
- **IMPLEMENT** syllabus parsing with Claude claude-sonnet-4-6
- **IMPLEMENT** JSON extraction from AI response (handle markdown code blocks)
- **VALIDATE**: `pnpm build` — no TS errors

### TASK 2: CREATE `src/app/api/syllabus/parse/route.ts`
- **IMPLEMENT** POST handler with auth check
- **IMPLEMENT** text body parsing (`req.json()`)
- **IMPLEMENT** PDF file handling: use `req.formData()`, extract text from PDF buffer
  - **GOTCHA**: PDF text extraction — use `pdf-parse` package OR just accept text-only in MVP and show instructions
  - **GOTCHA**: `export const maxDuration = 60;` for Vercel timeout
- **IMPLEMENT** call to `parseSyllabus()`
- **IMPLEMENT** error handling: empty input, AI failure, JSON parse failure
- **VALIDATE**: `curl -X POST http://localhost:3000/api/syllabus/parse -H "Content-Type: application/json" -d '{"syllabusText":"Python SQL analiza danych statystyka machine learning pandas numpy matplotlib seaborn"}'`

### TASK 3: CREATE `src/lib/ai/generate-gaps.ts`
- **IMPLEMENT** gap generation: compare student competencies vs job market data
- **IMPLEMENT** query job market data from DB: `db.query.jobMarketData.findMany({ where: eq(jobMarketData.careerGoal, careerGoal) })`
- **IMPLEMENT** AI-based comparison and prioritization
- **IMPLEMENT** save gaps to DB
- **IMPLEMENT** update competency statuses in DB

### TASK 4: CREATE `src/lib/ai/generate-skill-map.ts`
- **IMPLEMENT** React Flow nodes generation for each competency
- **IMPLEMENT** edges connecting related competencies (use AI to determine relationships)
- **IMPLEMENT** node positioning (use layered layout — group by category)
- **IMPLEMENT** save to skillMaps table

### TASK 5: CREATE `src/app/api/onboarding/route.ts`
- **IMPLEMENT** POST with auth
- **IMPLEMENT** upsert student record (in case of retry)
- **IMPLEMENT** insert competencies (delete existing first for idempotency)
- **IMPLEMENT** create passport record if not exists
- **IMPLEMENT** fire-and-forget: call generateGaps + generateSkillMap without await (use `.catch(console.error)`)
- **VALIDATE**: test with curl after UI is built

### TASK 6: CREATE onboarding UI components
- **CREATE** `src/components/onboarding/onboarding-wizard.tsx` — "use client", 3-step state machine
- **CREATE** `src/components/onboarding/step-profile.tsx` — profile form with university/careerGoal selects
- **CREATE** `src/components/onboarding/step-syllabus.tsx` — textarea + file upload + API call
- **CREATE** `src/components/onboarding/step-competencies.tsx` — editable competency list

### TASK 7: CREATE `src/app/(dashboard)/onboarding/page.tsx`
- **IMPLEMENT** server component with auth + redirect logic
- **IMPLEMENT** already-onboarded redirect to `/dashboard`

### TASK 8: UPDATE middleware.ts
- **UPDATE** `src/middleware.ts` to protect `/dashboard` and `/onboarding` routes
- **CHECK** for `better-auth.session_token` cookie
- **REDIRECT** to `/login` if no session

```typescript
export const config = {
	matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
```

---

## VALIDATION COMMANDS

```bash
pnpm build
pnpm lint
# Manual flow:
# 1. Register new account at /signup
# 2. Navigate to /onboarding
# 3. Fill step 1 (university, field, semester, career goal)
# 4. Fill step 2 (paste syllabus text)
# 5. Wait for AI parsing (<30s)
# 6. Review/edit competencies in step 3
# 7. Click "Zatwierdź" → should redirect to /dashboard
# 8. Verify DB: pnpm db:studio → check students, competencies, gaps tables
```

## ACCEPTANCE CRITERIA

- [ ] Unauthenticated users redirected to `/login`
- [ ] Already-onboarded users redirected to `/dashboard`
- [ ] Step 1: all fields validate correctly
- [ ] Step 2: syllabus text accepted (min 100 chars)
- [ ] Step 2: AI returns 15-40 competencies in <30s
- [ ] Step 3: competencies editable (add/remove/edit)
- [ ] Submit creates student + competencies in DB
- [ ] Submit creates passport record in DB
- [ ] Background gap + skill map generation starts
- [ ] Progress bar shows correct step (1/3, 2/3, 3/3)
- [ ] Error states shown for AI timeout, empty input
- [ ] `pnpm build` passes
