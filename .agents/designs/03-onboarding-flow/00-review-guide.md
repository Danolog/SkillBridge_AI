# Review Guide — Onboarding Wizard (Phase 03)

## Brand Consistency

This wireframe follows the **Cosmic Campus / Hybrid** design system established in Phase 02:
- Same color tokens (Indigo primary, Cyan secondary, Emerald CTA)
- Same typography (Nunito display, Inter body, JetBrains Mono data)
- Same glassmorphism card style, glow effects, pill buttons
- Dark header from landing page carried over

## Screen Map

| Screen | File | Description |
|--------|------|-------------|
| Onboarding Wizard (all 3 steps + success) | `wireframes/onboarding-wizard.html` | Interactive 3-step wizard with step transitions |

## How to Review

1. Open `wireframes/onboarding-wizard.html` in a browser
2. **Step 1 (Profil)**: Fill in university, field of study, semester, career goal. Select "Inne (wpisz)" to see custom input. Click "Dalej".
3. **Step 2 (Sylabus)**: Paste text or try the file upload area. Click "Analizuj sylabus" — see loading state with skeleton. After 2.5s, auto-transitions to Step 3.
4. **Step 3 (Kompetencje)**: Review editable list of 24 sample competencies. Try adding, editing, deleting. Click "Zatwierdź i utwórz Paszport".
5. **Success**: See completion state with redirect button.

## Key Design Decisions

1. **Single card with steps** — not separate pages. Keeps context and feels fast.
2. **Gradient top border on card** — brand signature carried from landing page.
3. **Animated progress dots** — active dot scales up with glow, completed dots show checkmark.
4. **Skeleton loading** — during AI parsing, shows shimmering placeholders to set expectations.
5. **Scrollable competency list** — max-height with custom scrollbar prevents card from growing too tall.
6. **Emerald CTA for final submit** — differentiates "next step" (indigo) from "final action" (emerald), consistent with landing page CTA.
7. **Staggered competency animation** — items appear one by one for visual polish.

## Implementation Notes for React

- **State machine**: `step` (1|2|3|'success') drives which `<Step>` renders
- **Form state**: Use `useState` for each field, pass via props to step components
- **shadcn/ui mapping**:
  - `form-select` → `<Select>` from shadcn
  - `form-input` → `<Input>`
  - `form-textarea` → `<Textarea>`
  - `form-label` → `<Label>`
  - `wizard-card` → `<Card>`
  - `btn-primary` → `<Button>` with custom gradient styling
- **File upload**: Native `<input type="file">` with drag-and-drop wrapper
- **Animation**: CSS only (no Framer Motion needed) — `@keyframes` in `globals.css`
