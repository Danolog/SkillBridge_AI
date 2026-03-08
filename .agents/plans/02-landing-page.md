# Feature: Landing Page

Read `00-master-roadmap.md` before implementing.

## Feature Description

Replace the placeholder `src/app/page.tsx` with a full SkillBridge AI landing page. Includes: hero section, 3-value propositions, "Jak to działa" (3 steps), CTA button, and a navigation header. Target: Polish-language, visually professional, converts visitors to `/onboarding`.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: `src/app/page.tsx`, `src/app/layout.tsx`
**Dependencies**: None (can run parallel to Feature 01)

---

## CONTEXT REFERENCES

### Files to Read Before Implementing

- `src/app/page.tsx` — current placeholder (just "SkillBridge AI" h1)
- `src/app/layout.tsx` — root layout with Geist font, AuthProvider, Toaster
- `src/components/ui/button.tsx` — Button component
- `src/components/ui/card.tsx` — Card component
- `src/components/auth/auth-provider.tsx` — just passes children through

### Available shadcn/ui Components
`button`, `card`, `separator`, `avatar`, `badge` (may need to install badge)

### Available Icons (lucide-react)
`BrainCircuit`, `TrendingUp`, `BookOpen`, `CheckCircle`, `ArrowRight`, `GraduationCap`, `Award`, `BarChart3`

---

## IMPLEMENTATION PLAN

### Screen Layout (per PRD section 9)

```
Header: Logo "SkillBridge AI" | Nav: Strona główna, Jak to działa, Panel Uczelni, Zaloguj się
---
Hero: H1 big headline + subtext + CTA "Stwórz swój Paszport"
---
3 Value Props (icons + titles + text):
  - Paszport Kompetencji
  - Market Intelligence
  - Mikro-kursy
---
"Jak to działa" — 3 numbered steps:
  1. Wgraj sylabus → AI parsuje kompetencje
  2. Odkryj luki → porównanie z rynkiem pracy
  3. Zamknij luki → spersonalizowane mikro-kursy
---
CTA Banner: "Gotowy/a? Stwórz swój Paszport kompetencji."
---
Footer: copyright SkillBridge AI 2026
```

### Copy (Polish)

**Hero H1**: "Twój sylabus spotyka się z rynkiem pracy."
**Hero subtext**: "SkillBridge AI analizuje Twój program studiów, identyfikuje luki kompetencyjne i generuje spersonalizowane mikro-kursy. Twoja droga do wymarzonej pracy zaczyna się tutaj."
**CTA Button**: "Stwórz swój Paszport"

**Value 1**: "Paszport Kompetencji" — "Twój osobisty, cyfrowy dokument umiejętności. Podziel się nim z pracodawcą jednym linkiem."
**Value 2**: "Market Intelligence" — "Dane z tysięcy ofert pracy w Polsce, aktualizowane na bieżąco. Wiesz dokładnie, czego szuka rynek."
**Value 3**: "Mikro-kursy AI" — "Automatycznie generowane, 15-30 minutowe kursy zamykające konkretne luki. Praktyczne, nie akademickie."

**Step 1**: "Wgraj sylabus" — "Wklej tekst lub prześlij PDF swojego programu studiów."
**Step 2**: "Odkryj luki" — "AI porównuje Twoje kompetencje z wymaganiami rynku dla wybranej ścieżki kariery."
**Step 3**: "Zamknij luki" — "Otrzymaj spersonalizowane mikro-kursy i buduj swój Paszport Kompetencji."

---

## STEP-BY-STEP TASKS

### TASK 1: UPDATE `src/app/page.tsx`

Complete rewrite. This is a **server component** (no "use client").

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, TrendingUp, BookOpen, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() { ... }
```

Structure:
1. `<header>` — sticky, logo left, nav right (links to `#how`, `/faculty/login`, `/login`)
2. `<section>` hero — centered, H1 + p + two buttons (CTA + "Zaloguj się")
3. `<section>` value props — 3-column grid with icon + title + text
4. `<section id="how">` — "Jak to działa" with numbered steps
5. `<section>` — CTA banner with "Stwórz swój Paszport"
6. `<footer>` — copyright

- **GOTCHA**: All text in Polish
- **GOTCHA**: CTA button links to `/onboarding` (not `/signup`)
- **GOTCHA**: "Panel Uczelni" links to `/faculty/login`
- **GOTCHA**: This is a server component — no useState, no useRouter
- **VALIDATE**: `pnpm build` — no errors

### TASK 2: UPDATE `src/app/layout.tsx`

- **UPDATE** metadata title: `"SkillBridge AI — Twój Paszport Kompetencji"`
- **UPDATE** metadata description: `"Platforma AI mapująca kompetencje studentów na wymagania rynku pracy."`
- **VALIDATE**: `pnpm build`

### TASK 3: UPDATE `src/components/auth/login-form.tsx`

- **UPDATE** redirect after successful login: change `router.push("/editor")` → `router.push("/dashboard")`
- **VALIDATE**: `pnpm build`

---

## VALIDATION COMMANDS

```bash
pnpm build
pnpm lint
# Manual: open http://localhost:3000 — verify landing page renders
# Manual: click "Stwórz swój Paszport" — should go to /onboarding (404 is OK at this stage)
# Manual: click "Zaloguj się" — should go to /login
```

## ACCEPTANCE CRITERIA

- [ ] Landing page renders at `/` with Polish copy
- [ ] Header with logo and navigation links
- [ ] Hero section with CTA button linking to `/onboarding`
- [ ] 3 value proposition cards with icons
- [ ] "Jak to działa" with 3 numbered steps
- [ ] Footer with copyright
- [ ] Login redirect updated to `/dashboard`
- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
