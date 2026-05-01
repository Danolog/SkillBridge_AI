# 10 — Project Marketplace

**Decision Document:** `docs/decisions/001-project-marketplace.md`

## Summary

Replaced AI-generated micro-courses with a Project Marketplace — real-world projects graduated L1-L5, sourced from open data and OSS. AI serves as matchmaker, brief writer, and reviewer instead of content generator.

## New Files

- `src/lib/ai/match-projects.ts` — Hybrid matchmaker (keyword overlap + Haiku LLM rerank)
- `src/lib/ai/generate-brief.ts` — Personalized project brief with inline Learning Steps
- `src/lib/ai/review-submission.ts` — AI submission review with cheat detection
- `src/lib/db/seed-projects.ts` — 20 demo projects (L1-L3)
- `src/app/(dashboard)/projects/` — Catalog + detail pages
- `src/app/api/projects/` — CRUD, recommend, brief, submit endpoints
- `src/components/projects/` — Card, catalog, detail, submission form
- `src/components/passport/project-receipts.tsx` — Verified Project Receipts

## Flow Mapping (Old -> New)

| Old Flow | New Flow |
|----------|----------|
| Gap card -> "Zamknij luke" -> /micro-courses | Gap card -> "Znajdz projekty" -> /projects?gapId=X |
| Generate micro-course | Browse projects -> Generate brief -> Work -> Submit |
| Complete course -> Update competency | Submit -> AI review -> Verified Receipt in Passport |
| Micro-course list in sidebar | Projects catalog in sidebar |

## Deprecated

- `microCourses` table — read-only, no new entries
- `generateMicroCourse()` — marked `@deprecated`, `generateLearningSteps` extracted as helper
- `/micro-courses` page — deprecation banner pointing to `/projects`
