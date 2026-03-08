# Feature: Faculty Panel (Panel Uczelni)

Read `00-master-roadmap.md`, `01-database-schema.md` before implementing.
**Requires Feature 01 (database schema with `students`, `competencies`, `gaps`, `jobMarketData` tables).**

## Feature Description

Dashboard for university lecturers accessible at `/faculty`. Login with shared password from env (`FACULTY_PASSWORD`). Shows: Recharts heatmap of competency coverage by career goal, Top 5 missing competencies across all students, AI-generated curriculum update suggestions. All data aggregated and anonymized (no student names/emails shown).

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: `src/app/faculty/`, `src/app/api/faculty/`, `src/components/faculty/`
**Dependencies**: Feature 01 (students, competencies, gaps, jobMarketData tables)

---

## CONTEXT REFERENCES

### Files to Read Before Implementing

- `src/lib/db/schema.ts` — `students`, `competencies`, `gaps`, `jobMarketData`, `passports` tables
- `src/app/(dashboard)/dashboard/page.tsx` — server component + DB query pattern
- `src/components/ui/card.tsx`, `button.tsx`, `input.tsx`, `label.tsx` — UI primitives
- `00-master-roadmap.md` — Drizzle query pattern, AI generation pattern

### New Files to Create

- `src/app/faculty/login/page.tsx` — login page (no auth required to view)
- `src/app/faculty/page.tsx` — dashboard page (requires faculty cookie)
- `src/app/api/faculty/login/route.ts` — POST: verify password, set cookie
- `src/app/api/faculty/logout/route.ts` — POST: clear cookie
- `src/app/api/faculty/dashboard/route.ts` — GET: aggregated data
- `src/components/faculty/faculty-login-form.tsx` — \"use client\" login form
- `src/components/faculty/faculty-dashboard.tsx` — \"use client\" dashboard
- `src/components/faculty/competency-heatmap.tsx` — Recharts heatmap
- `src/lib/ai/generate-faculty-suggestions.ts` — AI curriculum suggestions

### Auth Pattern for Faculty

Faculty uses **shared password** (not Better Auth) — simple cookie-based session:
- `POST /api/faculty/login`: compare `password` to `process.env.FACULTY_PASSWORD` → set `HttpOnly` cookie `faculty_session=authenticated`
- Pages and API routes check for `faculty_session=authenticated` cookie
- No JWT needed — single shared password, MVP only

### Add to `.env.local`

```
FACULTY_PASSWORD=your-secret-faculty-password
```

### Heatmap Data Shape

```typescript
type HeatmapData = {
	competencyName: string;
	careerGoal: string;
	coveragePercent: number; // % of students with this careerGoal who have this competency
	requiredByPercent: number; // % of job offers requiring this (from jobMarketData)
};

type DashboardData = {
	studentCount: number;
	heatmapData: HeatmapData[];
	topMissingCompetencies: Array<{
		name: string;
		missingCount: number;
		requiredByPercent: number;
		careerGoals: string[];
	}>;
	aiSuggestions: string[]; // 3-5 suggestions
	generatedAt: string;
};
```

---

## IMPLEMENTATION PLAN

### Phase 1: Auth Middleware Helper

Create a utility to check faculty cookie in server components and API routes:

```typescript
// src/lib/faculty-auth.ts
import { cookies } from "next/headers";

export async function checkFacultyAuth(): Promise<boolean> {
	const cookieStore = await cookies();
	return cookieStore.get("faculty_session")?.value === "authenticated";
}
```

### Phase 2: Login API + Page

**`src/app/api/faculty/login/route.ts`** (POST):
```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
	const { password } = await req.json();
	if (password !== process.env.FACULTY_PASSWORD) {
		return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 401 });
	}
	const response = NextResponse.json({ success: true });
	response.cookies.set("faculty_session", "authenticated", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 8, // 8 hours
		path: "/",
	});
	return response;
}
```

**`src/app/api/faculty/logout/route.ts`** (POST):
```typescript
// Clear cookie and return redirect
const response = NextResponse.json({ success: true });
response.cookies.delete("faculty_session");
return response;
```

**`src/components/faculty/faculty-login-form.tsx`** — \"use client\":
```
┌─────────────────────────────────┐
│ 🎓 Panel Uczelni               │
│ SkillBridge AI                  │
│─────────────────────────────────│
│ Hasło dostępu:                  │
│ [••••••••••••••]                │
│                                 │
│        [Zaloguj się]            │
│                                 │
│ ❌ Nieprawidłowe hasło          │  ← visible on error
└─────────────────────────────────┘
```
- On success: `router.push("/faculty")`
- On error: show inline error message

### Phase 3: Dashboard Data API

**`src/app/api/faculty/dashboard/route.ts`** (GET):
```typescript
// 1. Check faculty cookie → 401 if missing
// 2. Count total students
// 3. If < 3 students → return { tooFewStudents: true }
// 4. Aggregate heatmap data:
//    - Get all competencies with student's careerGoal
//    - For each (careerGoal, competencyName) pair: count how many students have it
//    - Cross-reference with jobMarketData for requiredByPercent
// 5. Get top 5 missing competencies:
//    - FROM gaps table, group by competencyName
//    - Order by count DESC, take top 5
// 6. Generate AI suggestions (or return cached)
// 7. Return DashboardData
export const maxDuration = 30;
```

**Data aggregation query**:
```typescript
// Heatmap: join competencies + students to get careerGoal context
const competencyData = await db
	.select({
		competencyName: competencies.name,
		careerGoal: students.careerGoal,
		status: competencies.status,
	})
	.from(competencies)
	.innerJoin(students, eq(competencies.studentId, students.id));

// Top missing: from gaps table
const topMissing = await db
	.select({
		name: gaps.competencyName,
		marketPct: gaps.marketPercentage,
	})
	.from(gaps)
	.orderBy(desc(gaps.marketPercentage))
	.limit(20); // deduplicate in JS
```

### Phase 4: AI Suggestions

**`src/lib/ai/generate-faculty-suggestions.ts`**:
```typescript
export async function generateFacultySuggestions(
	topMissingCompetencies: Array<{ name: string; requiredByPercent: number }>,
	studentCount: number,
): Promise<string[]> {
	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxTokens: 600,
		prompt: `Jesteś ekspertem ds. programów nauczania. Masz dane z ${studentCount} studentów uczelni.

Top brakujące kompetencje (których najbardziej brakuje studentom):
${topMissingCompetencies.slice(0, 5).map((c) => `- ${c.name}: wymagana przez ${c.requiredByPercent}% ofert pracy`).join("\n")}

Wygeneruj 3-5 konkretnych sugestii dla rady programowej uczelni.
Format każdej sugestii: "Rozważ dodanie modułu o [temat] — X% ofert na stanowisko [Y] tego wymaga."
Pisz po polsku, konkretnie i zwięźle.
Zwróć TYLKO tablicę JSON z ciągami znaków (bez markdown):
["Sugestia 1", "Sugestia 2", "Sugestia 3"]`,
	});
	const cleaned = text.trim().replace(/^```json?\n?/, "").replace(/\n?```$/, "");
	return JSON.parse(cleaned) as string[];
}
```

### Phase 5: Heatmap Component

**`src/components/faculty/competency-heatmap.tsx`** — \"use client\":

Uses Recharts `ResponsiveContainer` + `BarChart` (grouped bars by career goal):

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

// Color logic
function getCoverageColor(percent: number): string {
	if (percent >= 70) return "#22c55e"; // green-500
	if (percent >= 40) return "#eab308"; // yellow-500
	return "#ef4444"; // red-500
}

// Chart: X = competency name, Y = coverage %, color by coverage
// Tooltip shows: "X% studentów z celem [careerGoal] ma tę kompetencję"
```

Layout for heatmap section:
```
┌─────────────────────────────────────────────┐
│ Pokrycie kompetencji rynkowych              │
│ ─────────────────────────────────────────── │
│ [Recharts BarChart — competencies × coverage%] │
│                                             │
│ Legenda: ■ >70% (Dobry) ■ 40-70% (Średni) ■ <40% (Wymaga uwagi) │
└─────────────────────────────────────────────┘
```

### Phase 6: Faculty Dashboard Page

**`src/app/faculty/page.tsx`** — server component:
```typescript
import { checkFacultyAuth } from "@/lib/faculty-auth";
import { redirect } from "next/navigation";

export default async function FacultyPage() {
	const isAuth = await checkFacultyAuth();
	if (!isAuth) redirect("/faculty/login");

	// Fetch data from API
	// Pass to FacultyDashboard client component
}
```

**`src/components/faculty/faculty-dashboard.tsx`** — \"use client\":
```
┌─────────────────────────────────────────────┐
│ 🎓 Panel Uczelni — SkillBridge AI     [Wyloguj] │
│─────────────────────────────────────────────│
│ Analiza oparta na danych X studentów        │
│─────────────────────────────────────────────│
│ HEATMAPA KOMPETENCJI                        │
│ [Recharts BarChart]                         │
│─────────────────────────────────────────────│
│ TOP 5 BRAKUJĄCYCH KOMPETENCJI               │
│ 1. Python — brakuje 47 studentom (78% ofert)│
│ 2. SQL — brakuje 38 studentom (89% ofert)   │
│ 3. Docker — brakuje 31 studentom (71% ofert)│
│ 4. TypeScript — brakuje 28 studentom        │
│ 5. React — brakuje 25 studentom             │
│─────────────────────────────────────────────│
│ SUGESTIE AI DLA RADY PROGRAMOWEJ            │
│ ┌───────────────────────────────────────┐   │
│ │ 💡 Rozważ dodanie modułu o Python...  │   │
│ └───────────────────────────────────────┘   │
│ ┌───────────────────────────────────────┐   │
│ │ 💡 Moduł Docker/Konteneryzacja...    │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Empty/too-few-students state**:
```
Za mało danych — zachęć studentów do korzystania z SkillBridge AI
(minimum 3 studentów potrzebne do generowania raportu)
```

---

## STEP-BY-STEP TASKS

### TASK 1: ADD `FACULTY_PASSWORD` to `.env.local`
- **ADD**: `FACULTY_PASSWORD=faculty2024` (or any value) to `.env.local`
- **VALIDATE**: `pnpm build` — TypeScript compiles

### TASK 2: CREATE `src/lib/faculty-auth.ts`
- **IMPLEMENT** `checkFacultyAuth()` using Next.js `cookies()`
- **VALIDATE**: `pnpm build`

### TASK 3: CREATE `src/app/api/faculty/login/route.ts`
- **IMPLEMENT** POST handler: compare password to env, set HttpOnly cookie
- **IMPLEMENT** return 401 with Polish error message on mismatch
- **GOTCHA**: `response.cookies.set()` only works on `NextResponse` object, not on plain `Response`
- **VALIDATE**: `pnpm build`

### TASK 4: CREATE `src/app/api/faculty/logout/route.ts`
- **IMPLEMENT** POST handler: delete `faculty_session` cookie
- **VALIDATE**: `pnpm build`

### TASK 5: CREATE `src/components/faculty/faculty-login-form.tsx`
- **IMPLEMENT** password field + submit button
- **IMPLEMENT** fetch POST `/api/faculty/login`
- **IMPLEMENT** on 200 → `router.push("/faculty")`
- **IMPLEMENT** on 401 → show error state "Nieprawidłowe hasło"
- **VALIDATE**: `pnpm build`

### TASK 6: CREATE `src/app/faculty/login/page.tsx`
- **IMPLEMENT** centered layout with `<FacultyLoginForm />`
- **IMPLEMENT** simple card, no dashboard sidebar
- **VALIDATE**: `pnpm build`, open `/faculty/login` in browser

### TASK 7: CREATE `src/lib/ai/generate-faculty-suggestions.ts`
- **IMPLEMENT** AI suggestions generation with Polish output
- **IMPLEMENT** JSON array parsing with code block stripping
- **GOTCHA**: `export const maxDuration = 30;` must be in the API route, not in this function
- **VALIDATE**: `pnpm build`

### TASK 8: CREATE `src/app/api/faculty/dashboard/route.ts`
- **IMPLEMENT** GET: cookie check → 401 if missing
- **IMPLEMENT** student count check → return `{ tooFewStudents: true }` if < 3
- **IMPLEMENT** heatmap data aggregation: group competencies by (careerGoal, competencyName), compute coverage%
- **IMPLEMENT** top missing: aggregate gaps by competencyName, count occurrences, sort by count DESC
- **IMPLEMENT** call `generateFacultySuggestions()` with top 5 missing
- **GOTCHA**: `export const maxDuration = 30;` — AI generation can take up to 15s
- **VALIDATE**: `pnpm build`

### TASK 9: CREATE `src/components/faculty/competency-heatmap.tsx`
- **IMPLEMENT** Recharts `BarChart` with coverage data
- **IMPLEMENT** `getCoverageColor()` for green/yellow/red bars
- **IMPLEMENT** `ResponsiveContainer` with `width="100%" height={400}`
- **GOTCHA**: Recharts must be `"use client"` — it uses browser APIs
- **GOTCHA**: `recharts` is already in deps (no install needed)
- **VALIDATE**: `pnpm build`

### TASK 10: CREATE `src/components/faculty/faculty-dashboard.tsx`
- **IMPLEMENT** full dashboard layout with heatmap + top 5 + AI suggestions
- **IMPLEMENT** `tooFewStudents` empty state
- **IMPLEMENT** loading state while fetching
- **IMPLEMENT** logout button → POST `/api/faculty/logout` → `router.push("/faculty/login")`
- **VALIDATE**: `pnpm build`

### TASK 11: CREATE `src/app/faculty/page.tsx`
- **IMPLEMENT** server component with `checkFacultyAuth()` → redirect to `/faculty/login`
- **IMPLEMENT** fetch dashboard data from API
- **IMPLEMENT** pass data to `<FacultyDashboard />` client component
- **VALIDATE**: `pnpm build`, open `/faculty` in browser

---

## VALIDATION COMMANDS

```bash
pnpm build
pnpm lint
# Manual:
# 1. Open /faculty → should redirect to /faculty/login
# 2. Enter wrong password → "Nieprawidłowe hasło" visible
# 3. Enter correct password (from .env.local FACULTY_PASSWORD) → redirect to /faculty
# 4. Verify heatmap renders with colored bars
# 5. Verify top 5 missing competencies list
# 6. Verify AI suggestions appear (3-5 items in Polish)
# 7. Click logout → redirect to /faculty/login
# 8. Open /faculty directly after logout → redirect to /faculty/login
# 9. If <3 students: verify "Za mało danych" message
```

## ACCEPTANCE CRITERIA

- [ ] `/faculty/login` accessible without auth
- [ ] Wrong password shows "Nieprawidłowe hasło" error
- [ ] Correct password redirects to `/faculty`
- [ ] `/faculty` redirects to `/faculty/login` when not authenticated
- [ ] Dashboard shows student count
- [ ] Heatmap renders with green/yellow/red color coding (>70%/>40%/<40%)
- [ ] Top 5 missing competencies listed with counts and %
- [ ] AI suggestions show 3-5 items in Polish
- [ ] "Za mało danych" shown when student count < 3
- [ ] Logout clears cookie and redirects to `/faculty/login`
- [ ] No student names or emails shown (anonymized)
- [ ] `pnpm build` passes
