# SkillBridge AI — Master Implementation Roadmap

**Deadline**: 19 marca 2026 (12 dni)
**Stack**: Next.js 15 App Router · Better Auth · Drizzle ORM · PostgreSQL (Docker local / Neon prod) · Vercel AI SDK + Claude claude-sonnet-4-6 · Tailwind v4 · shadcn/ui · TypeScript strict · Biome

---

## Execution Order (strict dependency sequence)

| # | Plan File | Feature | Depends On | Complexity | Est. Time |
|---|-----------|---------|-----------|-----------|-----------|
| 01 | `01-database-schema.md` | DB Schema + Seed | — | Medium | 1h |
| 02 | `02-landing-page.md` | Landing Page | — | Low | 1h |
| 03 | `03-onboarding-flow.md` | Onboarding + Syllabus Parser | 01 | High | 3h |
| 04 | `04-dashboard-layout.md` | Dashboard Layout + Nav | 01, 03 | Low | 1h |
| 05 | `05-skill-map.md` | Skill Map (React Flow) | 01, 03, 04 | High | 3h |
| 06 | `06-gap-analysis.md` | Gap Analysis | 01, 03, 04 | Medium | 2h |
| 07 | `07-micro-courses.md` | Micro-course Generator | 06 | High | 2h |
| 08 | `08-passport.md` | Competency Passport + PDF + Public Link | 01, 03, 04, 07 | Medium | 2h |
| 09 | `09-faculty-panel.md` | Faculty Panel | 01 | Medium | 2h |

**Total estimated**: ~17h across 9 features

---

## Tech Stack Reference

### Framework
- **Next.js 15.5.12** — App Router, server components by default
- **React 19.1.0**
- **TypeScript** — strict mode, path alias `@/*` → `./src/*`

### Auth
- **Better Auth 1.5.4** — email+password enabled
- Server: `import { auth } from "@/lib/auth/server"`
- Client: `import { authClient } from "@/lib/auth/client"`
- Session (server component): `auth.api.getSession({ headers: await headers() })`
- Session (client): `authClient.useSession()` or `authClient.getSession()`

### Database
- **Drizzle ORM 0.45.1** — `import { db } from "@/lib/db"`
- **PostgreSQL** — Docker local (`postgresql://skillbridge:skillbridge@localhost:5432/skillbridge`)
- Push schema: `pnpm db:push`
- Studio: `pnpm db:studio`

### AI
- **Vercel AI SDK 6.x** — `import { streamText, generateText } from "ai"`
- **Anthropic provider** — `import { anthropic } from "@ai-sdk/anthropic"`
- **Model**: `anthropic('claude-sonnet-4-6')`

### UI Components (shadcn/ui — already installed)
- `@/components/ui/button`, `card`, `input`, `label`, `textarea`, `dialog`
- `@/components/ui/tabs`, `separator`, `sonner`, `dropdown-menu`, `avatar`
- **lucide-react** icons
- **recharts** (already in deps) for charts

### Code Style (Biome)
- Indent: **tabs**
- Quotes: **double**
- Trailing commas: **all**
- Semicolons: **always**
- Line width: 100

### Validation Commands (run after every feature)
```bash
pnpm build              # TypeScript + Next.js compile check
pnpm lint               # Biome linter
pnpm db:push            # If schema changed
```

---

## Shared Patterns

### Server Component Auth Check
```typescript
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/login");
const userId = session.user.id;
```

### API Route Auth Check
```typescript
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### Drizzle Query Pattern
```typescript
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { students } from "@/lib/db/schema";

const student = await db.query.students.findFirst({
	where: eq(students.userId, userId),
});
```

### AI Generation Pattern
```typescript
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const { text } = await generateText({
	model: anthropic("claude-sonnet-4-6"),
	prompt: `...`,
	maxTokens: 2000,
});
const result = JSON.parse(text);
```

### Toast Notifications
```typescript
import { toast } from "sonner";
toast.success("Message");
toast.error("Error message");
```

---

## File Structure After All Features

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← NEW: sidebar + nav
│   │   ├── dashboard/page.tsx      ← NEW: main dashboard hub
│   │   ├── onboarding/page.tsx     ← NEW: 3-step onboarding
│   │   ├── skill-map/page.tsx      ← NEW: React Flow
│   │   ├── gap-analysis/page.tsx   ← NEW
│   │   ├── micro-courses/
│   │   │   ├── page.tsx            ← NEW: courses list
│   │   │   └── [id]/page.tsx       ← NEW: single course
│   │   └── passport/page.tsx       ← NEW
│   ├── (public)/
│   │   └── passport/[id]/page.tsx  ← NEW: public read-only
│   ├── api/
│   │   ├── auth/[...path]/route.ts
│   │   ├── chat/route.ts
│   │   ├── onboarding/route.ts     ← NEW
│   │   ├── syllabus/parse/route.ts ← NEW
│   │   ├── skill-map/route.ts      ← NEW
│   │   ├── gaps/route.ts           ← NEW
│   │   ├── gaps/[id]/why/route.ts  ← NEW
│   │   ├── micro-courses/route.ts  ← NEW
│   │   ├── micro-courses/[id]/route.ts ← NEW
│   │   ├── passport/route.ts       ← NEW
│   │   └── faculty/
│   │       ├── login/route.ts      ← NEW
│   │       └── dashboard/route.ts  ← NEW
│   ├── faculty/
│   │   ├── login/page.tsx          ← NEW
│   │   └── page.tsx                ← NEW
│   ├── passport/[id]/page.tsx      ← NEW (public)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    ← UPDATE: landing page
├── components/
│   ├── auth/ (existing)
│   ├── ui/ (existing)
│   ├── onboarding/                 ← NEW
│   ├── skill-map/                  ← NEW
│   ├── gap-analysis/               ← NEW
│   ├── micro-courses/              ← NEW
│   ├── passport/                   ← NEW
│   └── faculty/                    ← NEW
└── lib/
    ├── auth/ (existing)
    ├── db/
    │   ├── index.ts (existing)
    │   ├── schema.ts               ← UPDATE: add all tables
    │   └── seed.ts                 ← NEW: job market data
    ├── ai/
    │   ├── parse-syllabus.ts       ← NEW
    │   ├── generate-skill-map.ts   ← NEW
    │   ├── generate-gaps.ts        ← NEW
    │   ├── generate-micro-course.ts ← NEW
    │   └── generate-why.ts         ← NEW
    └── utils.ts (existing)
```

---

## Merito Universities List (for onboarding dropdown)
```
WSB Merito Gdańsk, WSB Merito Gdynia, WSB Merito Wrocław,
WSB Merito Poznań, WSB Merito Warszawa, WSB Merito Bydgoszcz,
WSB Merito Toruń, WSB Merito Łódź, WSB Merito Szczecin,
WSB Merito Opole, WSB Merito Chorzów, WSB Merito Kraków,
WSB Merito Rzeszów, WSB Merito Lublin
```

## Career Goals List (for onboarding dropdown)
```
Data Analyst, Data Scientist, Frontend Developer, Backend Developer,
Full-stack Developer, UX/UI Designer, Project Manager,
DevOps Engineer, Cybersecurity Analyst, Inne (wpisz)
```
