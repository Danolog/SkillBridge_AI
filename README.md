# SkillBridge AI

Polish edtech platform that maps students' competencies (from university syllabus) to job market requirements, detects competency gaps, and connects students with graduated real-world projects. Built for the EduTech Masters competition by Grupa Merito.

## Features

- **Onboarding + Syllabus Parser** — 3-step wizard, AI parses university syllabus to extract competencies
- **Skill Map** — React Flow graph visualizing competencies vs. job market requirements
- **Gap Analysis** — AI detects missing skills with "why important" explanations
- **Project Marketplace** — Real-world projects graduated L1-L5 from open data and OSS. AI matchmaker recommends projects, generates personalized briefs with Learning Steps, and reviews submissions
- **Verified Project Receipts** — AI-reviewed project submissions displayed in the Competency Passport with scores, artifact links, and feedback
- **Competency Passport** — Shareable public page with student's skill profile and project receipts
- **Faculty Panel** — Aggregated dashboard showing program vs. market alignment (anonymized)

## Tech Stack

- **Framework:** Next.js 15 (App Router, `src/` directory)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui, Lucide icons, Recharts
- **Database:** PostgreSQL (Docker locally, Neon on production) + Drizzle ORM
- **Auth:** Better Auth (email+password, Google OAuth)
- **AI:** Vercel AI SDK + Anthropic Claude (claude-sonnet-4-6)
- **Testing:** Vitest (unit), Playwright (E2E)
- **Linting/Formatting:** Biome

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (Docker: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`)

### Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your database URL, Better Auth secret, and API keys.

3. **Run database migrations:**

   ```bash
   pnpm db:migrate
   ```

4. **Start the dev server:**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Lint with Biome |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format with Biome |
| `pnpm test` | Run unit tests (watch mode) |
| `pnpm test:run` | Run unit tests once |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:studio` | Open Drizzle Studio |
