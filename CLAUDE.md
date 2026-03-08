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
| Better Auth 1.5.4 | Auth — email+password, Google OAuth; `dash()` plugin via `@better-auth/infra` |
| Drizzle ORM 0.45.1 | Database ORM with `db.query.*` and `db.select()` |
| PostgreSQL (`pg`) | Database — Docker locally, Neon on production |
| Vercel AI SDK v6 (`ai`) | `streamText`, `generateText` |
| `@ai-sdk/anthropic` | Anthropic provider for Claude |
| Tailwind CSS v4 | Styling via `@tailwindcss/postcss` |
| shadcn/ui | Component library in `src/components/ui/` |
| Recharts 3.x | Charts (faculty heatmap) — planned |
| Zod 4.x | Schema validation |
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
pnpm test:coverage # vitest with coverage
pnpm test:e2e      # bash-based E2E scripts (requires pnpm dev running)

# Database
pnpm db:push       # push schema to DB (no migration files)
pnpm db:studio     # Drizzle Studio UI
pnpm db:generate   # generate migration files
pnpm db:migrate    # run migrations
```

---

## Implementation Status

### ✅ Currently Implemented
- Auth: login/signup pages, Google OAuth, Better Auth server + client
- DB schema: Better Auth tables only (`user`, `session`, `account`, `verification`)
- AI chat: `/api/chat` route + `/chat` page (streaming with Claude Sonnet 4.6)
- Landing page (`/`) — minimal placeholder
- UI components: `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `separator`, `sonner`, `tabs`, `textarea`, `avatar`
- Biome config, Vitest config

### 🔲 Planned (not yet built)
- Dashboard layout with sidebar
- Onboarding (3-step wizard + AI syllabus parser)
- Skill Map (React Flow competency graph)
- Gap Analysis
- Micro-courses (AI-generated, step-by-step)
- Competency Passport (shareable public page + PDF export)
- Faculty Panel (shared password auth, aggregated heatmap)
- Domain DB tables (students, competencies, skills, gaps, courses, etc.)
- AI generation modules (`src/lib/ai/`)
- Route protection in middleware

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Login + signup pages (centered layout)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/             # [PLANNED] Authenticated app — sidebar layout
│   │   ├── layout.tsx           # Auth check + sidebar shell
│   │   ├── dashboard/page.tsx   # Hub with 4 nav tiles
│   │   ├── onboarding/page.tsx  # 3-step onboarding + syllabus parser
│   │   ├── skill-map/page.tsx   # React Flow competency graph
│   │   ├── gap-analysis/page.tsx
│   │   ├── micro-courses/
│   │   │   ├── page.tsx         # Course list
│   │   │   └── [id]/page.tsx    # Single course view
│   │   └── passport/page.tsx    # Competency passport
│   ├── faculty/                 # [PLANNED] Faculty panel (shared password auth)
│   │   ├── login/page.tsx
│   │   └── page.tsx
│   ├── passport/[id]/page.tsx   # [PLANNED] PUBLIC passport (no login required)
│   ├── chat/page.tsx            # Dev/demo AI chat page
│   ├── api/
│   │   ├── auth/[...path]/route.ts  # Better Auth handler
│   │   ├── chat/route.ts            # AI streaming chat
│   │   ├── onboarding/          # [PLANNED] Save student + competencies
│   │   ├── syllabus/parse/      # [PLANNED] AI syllabus parser
│   │   ├── skill-map/           # [PLANNED] Skill map CRUD
│   │   ├── gaps/                # [PLANNED] Gap list + "why important" AI
│   │   ├── micro-courses/       # [PLANNED] Course generation + completion
│   │   ├── passport/            # [PLANNED] Passport data
│   │   └── faculty/             # [PLANNED] Faculty login + dashboard data
│   ├── globals.css
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page (public)
├── components/
│   ├── auth/                    # Login/signup forms + Google button
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # [PLANNED] Sidebar, nav tiles, hub
│   ├── onboarding/              # [PLANNED] 3-step wizard components
│   ├── skill-map/               # [PLANNED] React Flow nodes, panels
│   ├── gap-analysis/            # [PLANNED] Gap cards, list
│   ├── micro-courses/           # [PLANNED] Course view, step accordion
│   ├── passport/                # [PLANNED] Passport card, PDF export
│   └── faculty/                 # [PLANNED] Faculty login form, heatmap
└── lib/
    ├── auth/
    │   ├── server.ts            # betterAuth instance (email+password + Google + dash)
    │   └── client.ts            # authClient (use client)
    ├── db/
    │   ├── index.ts             # db instance
    │   └── schema.ts            # Better Auth tables (domain tables to be added)
    ├── ai/                      # [PLANNED] AI generation modules
    │   ├── parse-syllabus.ts
    │   ├── generate-skill-map.ts
    │   ├── generate-gaps.ts
    │   ├── generate-why.ts      # "Why is this important?"
    │   ├── generate-micro-course.ts
    │   └── generate-faculty-suggestions.ts
    ├── faculty-auth.ts          # [PLANNED] Cookie check for faculty panel
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
- **Test location**: `src/**/*.{test,spec}.{ts,tsx}` and `tests/unit/**/*.{test,spec}.{ts,tsx}`
- **Framework**: Vitest + React Testing Library
- **E2E**: bash scripts in `tests/e2e/` — `pnpm test:e2e` (requires `pnpm dev` running)

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
| `src/middleware.ts` | Next.js middleware — add route protection matchers here (currently no-op) |
| `drizzle.config.ts` | Drizzle Kit config (loads `.env.local` via dotenv) |
| `.agents/plans/00-master-roadmap.md` | Implementation sequence and shared patterns |

---

## On-Demand Context

| Topic | File |
|-------|------|
| Full implementation roadmap | `.agents/plans/00-master-roadmap.md` |
| DB schema plan | `.agents/plans/01-database-schema.md` |
| Landing page | `.agents/plans/02-landing-page.md` |
| Onboarding + syllabus parser | `.agents/plans/03-onboarding-flow.md` |
| Dashboard layout | `.agents/plans/04-dashboard-layout.md` |
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
- **`@better-auth/infra` `dash()` plugin**: already configured in `src/lib/auth/server.ts` — provides Better Auth dashboard
