# Decision Document: Pivot to Project Marketplace

**Status:** Accepted
**Date:** 2026-05-01
**Author:** Darek (with Claude Code)

---

## Context

SkillBridge AI currently closes competency gaps via AI-generated micro-courses. While functional, this approach has limitations:

1. **Content quality** — AI-generated courses lack the depth and practical grounding of real-world projects
2. **Employer signal** — "I completed an AI-generated course" carries less weight than "I built X with real data"
3. **Scalability** — each course is generated from scratch, no reuse across students
4. **Differentiation** — many platforms offer AI-generated content; few connect students to real open-data and OSS projects

The pivot replaces micro-courses with a **Project Marketplace** — a catalog of real-world projects graduated L1-L5, sourced from open data (dane.gov.pl, BDL GUS) and open-source repositories. AI shifts from content generator to **matchmaker, brief writer, and reviewer**.

---

## Decision

**Full pivot**, not parallel coexistence. The `microCourses` table stays in the database (deprecated, read-only) but no new courses are generated. The sidebar navigation replaces `/micro-courses` with `/projects`. The micro-courses page gets a deprecation banner pointing to projects.

---

## Key Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Pivot strategy | Full pivot, not coexistence | Simpler UX, clear product story, less maintenance |
| 2 | Theory delivery | Learning Steps inline in project brief | Reuses `generateMicroCourse` as helper via extracted `generateLearningSteps` |
| 3 | MVP data sources | Open-data + OSS only (L1-L3) | Partner sources (L4-L5) deferred to Phase C |
| 4 | Matchmaker algorithm | Keyword overlap + LLM rerank (Haiku) | Good enough for MVP; embeddings deferred to Phase B |
| 5 | AI review mode | Synchronous, `maxDuration=60` | Async queue deferred to Phase B |
| 6 | DB change strategy | Drizzle migrations as source of truth | Required for production; `db:push` deprecated |
| 7 | Auth model | Unchanged — Better Auth (student) + faculty cookie | Partner module and unified roles deferred to Phase C |
| 8 | AI models | Sonnet 4.6 for generation, Haiku 4.5 for matchmaker | Cost optimization — matchmaker needs speed, not depth |
| 9 | Auto-grading scope | L1-L3 auto-graded by AI | L4-L5 require partner review (deferred) |
| 10 | Passport integration | Verified Project Receipts section | Replaces course completion tracking as proof of skills |

---

## Open Questions

- **Partner onboarding flow:** How will companies submit projects? (Deferred to Phase C)
- **Embedding-based matching:** When to upgrade from keyword overlap? (Phase B, after user feedback)
- **Source URL validation:** How to handle dead links in open-data sources? (Manual for MVP, automated later)
- **Review accuracy:** How to measure AI review quality? (Collect feedback, iterate on prompts)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI review quality insufficient | Students get wrong scores | Medium | Conservative thresholds (score >= 70 AND cheatRisk < 0.5 for auto-verify), manual review fallback |
| Cheat detection false positives | Legitimate work flagged | Medium | `cheatRiskScore` only flags for manual review, doesn't auto-reject |
| Source URLs become stale | Projects link to dead data | Low | sourceUrl is advisory; brief includes data description |
| 60s timeout not enough for review | Submission fails | Low | Retry mechanism in UI; async queue in Phase B |
| Students confused by pivot | Drop in engagement | Medium | Clear onboarding, deprecation banner on old page |

---

## Implementation Order

1. **Phase 0:** Setup (branch, docs)
2. **Phase 1:** DB foundation (migrations, schema, seed)
3. **Phase 2:** Backend AI + API (matchmaker, brief, review, endpoints)
4. **Phase 3:** Frontend (catalog, detail, submission, passport receipts, nav cleanup)
5. **Phase 4:** Validation + PR (E2E tests, docs update)

---

## Out of Scope

- Payments and monetization
- Mobile app / PWA
- Internationalization (i18n)
- Partner module (company accounts, project submission)
- NDA flow for exclusive projects
- Embedding-based matching (pgvector)
- Async review queue (background jobs)
- L4-L5 projects (require partner infrastructure)
- microCourses data migration or deletion (table stays as-is)
