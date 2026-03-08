# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

SkillBridge AI is a Polish edtech platform that maps students' competencies (from their university syllabus) to job market requirements, detects competency gaps, and generates personalized AI micro-courses. Built for the EduTech Masters competition by Grupa Merito (deadline: 19 March 2026). Students get a shareable Competency Passport; faculty get an aggregated dashboard showing program vs. market alignment.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15.5.12 (App Router) | Framework — server components by default |
| React 19.1.0 | UI rendering |
| TypeScript (strict) | Type safety, path alias `@/*` → `./src/*` |
| Better Auth 1.5.4 | Auth — email+password, Google OAuth |
| Drizzle ORM 0.45.1 | Database ORM with `db.query.*` and `db.select()` |
| PostgreSQL | Database — Docker locally, Neon on production |
| Vercel AI SDK v6 (`ai`) | `streamText`, `generateText` |
| `@ai-sdk/anthropic` | Anthropic provider for Claude |
| Tailwind CSS v4 | Styling via `@tailwindcss/postcss` |
| shadcn/ui | Component library in `src/components/ui/` |
| Recharts 3.x | Charts (faculty heatmap) |
| Biome 2.x | Linting + formatting (replaces ESLint + Prettier) |
| Vitest | Unit/component tests |

---

## Commands

```bash
# Development
pnpm dev

# Build (TypeScript + Next.js compile check)
pnpm build

# Lint (Biome)
pnpm lint
pnpm lint:fix

# Format
pnpm format

# Tests
pnpm test          # vitest watch
pnpm test:run      # vitest run (CI)

# Database
pnpm db:push       # push schema to DB (no migration files)
pnpm db:studio     # Drizzle Studio UI
pnpm db:generate   # generate migration files
pnpm db:seed       # seed job market data (after adding script)
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Login + signup pages (centered layout)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/             # Authenticated app — sidebar layout
│   │   ├── layout.tsx           # Auth check + sidebar shell
│   │   ├── dashboard/page.tsx   # Hub with 4 nav tiles
│   │   ├── onboarding/page.tsx  # 3-step onboarding + syllabus parser
│   │   ├── skill-map/page.tsx   # React Flow competency graph
│   │   ├── gap-analysis/page.tsx
│   │   ├── micro-courses/
│   │   │   ├── page.tsx         # Course list
│   │   │   └── [id]/page.tsx    # Single course view
│   │   └── passport/page.tsx    # Competency passport
│   ├── faculty/                 # Faculty panel (shared password auth)
│   │   ├── login/page.tsx
│   │   └── page.tsx
│   ├── passport/[id]/page.tsx   # PUBLIC passport (no login required)
│   ├── api/
│   │   ├── auth/[...path]/      # Better Auth handler
│   │   ├── chat/                # AI chat endpoint
│   │   ├── onboarding/          # Save student + competencies
│   │   ├── syllabus/parse/      # AI syllabus parser
│   │   ├── skill-map/           # Skill map CRUD
│   │   ├── gaps/                # Gap list + "why important" AI
│   │   ├── micro-courses/       # Course generation + completion
│   │   ├── passport/            # Passport data
│   │   └── faculty/             # Faculty login + dashboard data
│   └── page.tsx                 # Landing page (public)
├── components/
│   ├── auth/                    # Login/signup forms
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Sidebar, nav tiles, hub
│   ├── onboarding/              # 3-step wizard components
│   ├── skill-map/               # React Flow nodes, panels
│   ├── gap-analysis/            # Gap cards, list
│   ├── micro-courses/           # Course view, step accordion
│   ├── passport/                # Passport card, PDF export
│   └── faculty/                 # Faculty login form, heatmap
└── lib/
    ├── auth/
    │   ├── server.ts            # betterAuth instance
    │   └── client.ts            # authClient (use client)
    ├── db/
    │   ├── index.ts             # db instance
    │   ├── schema.ts            # ALL tables (Better Auth + domain)
    │   └── seed.ts              # Job market data seed
    ├── ai/
    │   ├── parse-syllabus.ts    # AI syllabus parser
    │   ├── generate-skill-map.ts
    │   ├── generate-gaps.ts
    │   ├── generate-why.ts      # "Why is this important?"
    │   ├── generate-micro-course.ts
    │   └── generate-faculty-suggestions.ts
    ├── faculty-auth.ts          # Cookie check for faculty panel
    └── utils.ts                 # cn() helper
```

---

## Architecture

**Next.js App Router** — server components by default, `"use client"` only where needed (interactivity, hooks, browser APIs).

Data flow:
1. **Server components** fetch data directly from DB via Drizzle, pass as props to client components
2. **Client components** call API routes for mutations and AI generation
3. **API routes** handle auth, DB writes, and AI calls (never from client directly)
4. **AI generation** always server-side via Vercel AI SDK + Anthropic provider

Route groups:
- `(auth)` — centered layout, no sidebar (public login/signup)
- `(dashboard)` — sidebar shell, requires Better Auth session
- `faculty/` — standalone, requires `faculty_session` cookie
- `passport/[id]` — fully public, no auth

---

## Code Patterns

### Auth — Server Component
```typescript
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/login");
const userId = session.user.id;
```

### Auth — API Route
```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### Auth — Client Component
```typescript
import { authClient } from "@/lib/auth/client";
const { data: session } = authClient.useSession();
// or
await authClient.signOut();
```

### Database Query
```typescript
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { students } from "@/lib/db/schema";

const student = await db.query.students.findFirst({
	where: eq(students.userId, userId),
});
```

### AI Generation
```typescript
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const { text } = await generateText({
	model: anthropic("claude-sonnet-4-6"),
	maxTokens: 2000,
	prompt: `...`,
});
// Strip JSON code blocks before parsing:
const cleaned = text.trim().replace(/^```json?\n?/, "").replace(/\n?```$/, "");
const result = JSON.parse(cleaned);
```

Always add `export const maxDuration = 60;` to API routes that call AI (generation can take 15–30s).

### Toast Notifications
```typescript
import { toast } from "sonner";
toast.success("Sukces!");
toast.error("Błąd!");
```

### Naming Conventions
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `camelCase` with `use` prefix
- DB tables: `camelCase` in TS, `snake_case` in SQL
- API routes: `route.ts` inside directory matching URL path

### Code Style (Biome)
- Indent: **tabs** (not spaces)
- Quotes: **double**
- Trailing commas: **all**
- Semicolons: **always**
- Line width: 100

---

## Testing

- **Run tests**: `pnpm test:run`
- **Test location**: `tests/` (unit/component) and `tests/e2e/` (Playwright)
- **Framework**: Vitest + React Testing Library
- **E2E**: `pnpm test:e2e` (requires `pnpm dev` running)

---

## Validation

Run after every feature:

```bash
pnpm build     # TypeScript + Next.js compile — must pass with 0 errors
pnpm lint      # Biome — must pass with 0 warnings
pnpm db:push   # Only if schema.ts changed
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/db/schema.ts` | Single source of truth for all DB tables and relations |
| `src/lib/auth/server.ts` | Better Auth instance — import `auth` from here |
| `src/lib/auth/client.ts` | Client-side auth — import `authClient` from here |
| `src/lib/db/index.ts` | Drizzle DB instance — import `db` from here |
| `src/middleware.ts` | Next.js middleware — add route protection matchers here |
| `drizzle.config.ts` | Drizzle Kit config (loads `.env.local` via dotenv) |
| `.agents/plans/00-master-roadmap.md` | Implementation sequence and shared patterns |

---

## On-Demand Context

| Topic | File |
|-------|------|
| Full implementation roadmap | `.agents/plans/00-master-roadmap.md` |
| DB schema plan | `.agents/plans/01-database-schema.md` |
| Onboarding + syllabus parser | `.agents/plans/03-onboarding-flow.md` |
| Skill Map (React Flow) | `.agents/plans/05-skill-map.md` |
| Gap Analysis | `.agents/plans/06-gap-analysis.md` |
| Micro-courses | `.agents/plans/07-micro-courses.md` |
| Competency Passport + PDF | `.agents/plans/08-passport.md` |
| Faculty Panel | `.agents/plans/09-faculty-panel.md` |
| Product requirements | `.claude/PRD.md` |

---

## Notes

- **AI model**: always use `anthropic("claude-sonnet-4-6")` — no other model
- **DB push over migrations**: use `pnpm db:push` in development (no migration files needed until production)
- **No SSR for browser-only libs**: `jsPDF`, `html2canvas`, `@xyflow/react` — must be `"use client"` and dynamically imported if needed
- **Faculty auth**: separate from Better Auth — uses `FACULTY_PASSWORD` env var + `faculty_session` HttpOnly cookie
- **Polish UI**: all user-facing text is in Polish (labels, toasts, error messages, AI outputs)
- **Anonymized faculty data**: faculty panel never shows student names or emails
- **Biome over ESLint**: do NOT add ESLint config — project uses Biome exclusively
- **pnpm only**: do NOT use npm or yarn — project uses pnpm workspaces
