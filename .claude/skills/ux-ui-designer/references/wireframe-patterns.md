# Wireframe Patterns — Screen Type Reference

Detailed patterns for common screen types. Use these as starting points, then customize based on the specific PRD.

## Pattern 1: Dashboard Screen

Dashboards are the "home base" of a SaaS app. Their purpose is to give an at-a-glance snapshot of what matters to the user.

### Layout Structure

```
┌──────────┬──────────────────────────────────────────┐
│          │ Page Title            [Action Button]     │
│  SIDEBAR │                                          │
│          │ ┌────────┐ ┌────────┐ ┌────────┐        │
│          │ │Stat    │ │Stat    │ │Stat    │        │
│          │ │Card    │ │Card    │ │Card    │        │
│          │ └────────┘ └────────┘ └────────┘        │
│          │                                          │
│          │ ┌─────────────────┐ ┌──────────────┐    │
│          │ │                 │ │              │    │
│          │ │  Main Chart/    │ │  Secondary   │    │
│          │ │  Visualization  │ │  Widget      │    │
│          │ │                 │ │              │    │
│          │ └─────────────────┘ └──────────────┘    │
│          │                                          │
│          │ ┌────────────────────────────────────┐   │
│          │ │  Recent Activity / Data Table      │   │
│          │ └────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────┘
```

### Dashboard UX Principles

1. **Information hierarchy**: Most important metrics at top (stat cards), details below
2. **Stat cards**: Show current value + trend (↑12% vs last period). Use color to indicate positive/negative.
3. **Progressive disclosure**: Summary on dashboard → click to drill down into detail page
4. **Time context**: Always show when data was last updated
5. **Empty state**: If no data yet, show helpful onboarding message, not blank space
6. **Loading**: Use skeleton loaders matching the layout of content being loaded

### Stat Card Pattern

```
┌──────────────────────┐
│ Label          [icon] │  ← text-sm, color-secondary
│ 1,234                │  ← text-2xl, font-bold
│ ↑ 12% vs last month │  ← text-xs, color-success
└──────────────────────┘
min-width: 200px, flex: 1
```

### Responsive Dashboard

- Desktop: 3-4 stat cards in row, 2-column layout below
- Tablet: 2 stat cards per row, single column below
- Mobile: 1 stat card per row, everything stacked

## Pattern 2: Onboarding / Wizard Flow

Multi-step forms where the user completes a sequential process.

### Layout Structure

```
┌──────────────────────────────────────────┐
│ Logo                              Step X │
│                                    of Y  │
│ ┌────────────────────────────────────┐   │
│ │  Progress Bar  ████████░░░░░ 60%  │   │
│ └────────────────────────────────────┘   │
│                                          │
│    Step Title                            │
│    Brief description of what this        │
│    step is about                         │
│                                          │
│    ┌────────────────────────────┐        │
│    │ Form Fields                │        │
│    │                            │        │
│    │ [Label]                    │        │
│    │ ┌──────────────────────┐   │        │
│    │ │ Input                │   │        │
│    │ └──────────────────────┘   │        │
│    │                            │        │
│    │ [Label]                    │        │
│    │ ┌──────────────────────┐   │        │
│    │ │ Input                │   │        │
│    │ └──────────────────────┘   │        │
│    └────────────────────────────┘        │
│                                          │
│    [← Wstecz]           [Dalej →]       │
└──────────────────────────────────────────┘
```

### Wizard UX Principles

1. **Progress indicator**: Always show which step they're on and how many remain
2. **One concept per step**: Don't overload a single step with unrelated fields
3. **Allow going back**: "Wstecz" button should preserve entered data
4. **Validate inline**: Show errors on blur, not only on submit
5. **Center the form**: max-width 480-560px for form content, centered on page
6. **No sidebar needed**: Full-screen focus reduces distraction during onboarding
7. **Motivational copy**: Brief text explaining why each step matters

### Responsive Wizard

- All breakpoints: Form stays centered, max-width prevents it from stretching
- Mobile: Stack buttons vertically, "Dalej" on top (primary action)
- Reduce vertical spacing on mobile

## Pattern 3: Data Visualization Screen

Screens centered around charts, graphs, or interactive data displays.

### Layout Structure (for Skill Map / Graph view)

```
┌──────────┬──────────────────────────────────────────┐
│          │ Title           [Filter] [View Toggle]    │
│  SIDEBAR │                                          │
│          │ ┌───────────────────────────┬──────────┐ │
│          │ │                           │          │ │
│          │ │   Interactive Graph /     │  Detail  │ │
│          │ │   Chart Area              │  Panel   │ │
│          │ │                           │  (Sheet) │ │
│          │ │                           │          │ │
│          │ │   [Zoom] [Pan] [Reset]    │          │ │
│          │ │                           │          │ │
│          │ └───────────────────────────┴──────────┘ │
│          │                                          │
│          │ ┌────────────────────────────────────┐   │
│          │ │ Legend / Summary Stats             │   │
│          │ └────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────┘
```

### Data Viz UX Principles

1. **Tooltips on hover**: Show detailed data for any element the user mouses over
2. **Legend is visible**: Don't hide the legend — place it below or beside the chart
3. **Filtering controls**: Place above the chart, clearly labeled
4. **Color + pattern**: Don't rely only on color — add patterns, labels, or shapes for accessibility
5. **Detail panel**: Clicking a data point opens a side panel (Sheet) with full details
6. **Controls visible**: Zoom, pan, reset buttons visible but not obstructing the chart
7. **Responsive**: On mobile, chart takes full width; detail panel becomes a bottom sheet

## Pattern 4: List / Gap Analysis Screen

Screens showing a prioritized list of items with actions.

### Layout Structure

```
┌──────────┬──────────────────────────────────────────┐
│          │ Title                     [Sort ▼]       │
│  SIDEBAR │ Subtitle / description                    │
│          │                                          │
│          │ ┌────────────────────────────────────┐   │
│          │ │ 🔴 Critical                       │   │
│          │ │ Item Name                          │   │
│          │ │ "Wymaga tego 78% ofert..."         │   │
│          │ │ ⏱️ ~10h   📊 78%                  │   │
│          │ │                    [Zamknij lukę →]│   │
│          │ │                                    │   │
│          │ │ ▼ Dlaczego to ważne?               │   │
│          │ │   [Expandable content...]          │   │
│          │ └────────────────────────────────────┘   │
│          │                                          │
│          │ ┌────────────────────────────────────┐   │
│          │ │ 🟡 Important                      │   │
│          │ │ Item Name                          │   │
│          │ │ ...                                │   │
│          │ └────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────┘
```

### List UX Principles

1. **Visual priority**: Use color badges + size to indicate priority (Critical = larger card, red badge)
2. **Scannable**: Each card has consistent layout — user learns the pattern once
3. **Action prominent**: Primary CTA visible without expanding
4. **Progressive disclosure**: "Dlaczego to ważne?" as expandable accordion
5. **Filtering/sorting**: Top of list, clear controls
6. **Empty state**: "Gratulacje! Brak luk kompetencyjnych" with celebration icon

## Pattern 5: Profile / Passport View

Read-mainly screens showing a user's profile or portfolio.

### Layout Structure (Private view with edit)

```
┌──────────┬──────────────────────────────────────────┐
│          │ ┌────────────────────────────────────┐   │
│  SIDEBAR │ │  Avatar  Name                     │   │
│          │ │          University, Faculty       │   │
│          │ │          Career Goal               │   │
│          │ │                                    │   │
│          │ │  ████████████████░░░░ 72%          │   │
│          │ │  "Pokrycie wymagań rynku"          │   │
│          │ │                                    │   │
│          │ │  [Eksportuj PDF] [Kopiuj Link]    │   │
│          │ └────────────────────────────────────┘   │
│          │                                          │
│          │ ┌────────────────────────────────────┐   │
│          │ │ Kompetencje                        │   │
│          │ │                                    │   │
│          │ │ 🟢 Python — analiza danych  Zaawansowany │
│          │ │ 🟢 SQL — zapytania         Średni │   │
│          │ │ 🟡 React — frontend        Podstawowy │
│          │ │ 🔴 Docker — konteneryzacja Brak   │   │
│          │ │ ...                                │   │
│          │ └────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────┘
```

### Public View Layout (no sidebar, no edit)

```
┌──────────────────────────────────────────────────────┐
│  Logo                              SkillBridge AI    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Profile Card — same as above but no edit buttons]  │
│                                                      │
│  [Competency List — same as above but read-only]     │
│                                                      │
│  ───────────────────────────────────────             │
│  Wygenerowano: 2026-03-07                            │
│  [Stwórz swój Paszport →]                           │
└──────────────────────────────────────────────────────┘
max-width: 800px, centered
```

### Profile UX Principles

1. **Hero section**: Name, key info, and progress bar at top — this is the first thing a viewer sees
2. **Progress bar**: Prominent, with percentage and label
3. **Competency badges**: Color-coded (green/yellow/red), with skill level text alongside
4. **Public view**: Clean, professional, no editing controls, centered layout
5. **Export actions**: Prominent but not dominating — secondary button style
6. **PDF layout**: Match the web layout closely so there's no surprise

## Pattern 6: Admin / Faculty Panel

Dashboard for administrators with aggregated data.

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ Logo    Panel Wykładowcy              [Wyloguj]      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Heatmapa dopasowania programu                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ Przedmiot           │ Pokrycie │ Status      │    │
│  ├─────────────────────┼──────────┼─────────────┤    │
│  │ Bazy danych         │ ████ 85% │ 🟢         │    │
│  │ Programowanie obj.  │ ███░ 65% │ 🟡         │    │
│  │ Algebra liniowa     │ ██░░ 35% │ 🔴         │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Top 5 brakujących kompetencji                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ 1. Docker — 72% ofert wymaga                │    │
│  │ 2. CI/CD — 68% ofert wymaga                 │    │
│  │ 3. Cloud (AWS/GCP) — 61% ofert wymaga       │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Sugestie AI                                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ 💡 Rozważ dodanie modułu o Docker/Kubernetes│    │
│  │    — 72% ofert na stanowisko DevOps wymaga   │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Admin Panel UX Principles

1. **Simple navigation**: Top bar only (no sidebar needed for 1-2 pages)
2. **Data-first**: Heatmap/table is the main content, front and center
3. **Color coding in tables**: Inline progress bars with green/yellow/red
4. **Actionable suggestions**: AI recommendations in distinct card style (with lightbulb icon)
5. **Minimal chrome**: Less decoration than student-facing pages — faculty want data, not delight

## Pattern 7: Micro-Course Viewer

Content viewer for step-by-step learning content.

### Layout Structure

```
┌──────────┬──────────────────────────────────────────┐
│          │ ← Powrót do listy kursów                 │
│  SIDEBAR │                                          │
│          │ Kurs: Podstawy pandas w 15 minut         │
│          │ ████████████░░░░░░ 3/5 kroków            │
│          │                                          │
│          │ ┌────────────────────────────────────┐   │
│          │ │ Krok 3: Filtrowanie danych         │   │
│          │ │                                    │   │
│          │ │ [Markdown content rendered as       │   │
│          │ │  rich text with code blocks,        │   │
│          │ │  headings, lists]                   │   │
│          │ │                                    │   │
│          │ │ 📝 Ćwiczenie:                      │   │
│          │ │ ┌────────────────────────────────┐ │   │
│          │ │ │ Otwórz Google Colab i...       │ │   │
│          │ │ └────────────────────────────────┘ │   │
│          │ │                                    │   │
│          │ │ 📚 Zasoby:                        │   │
│          │ │ • Video: Pandas tutorial (15 min)  │   │
│          │ │ • Docs: pandas.pydata.org          │   │
│          │ └────────────────────────────────────┘   │
│          │                                          │
│          │ [← Poprzedni krok]    [Następny krok →]  │
│          │                                          │
│          │ Step indicators: ● ● ◉ ○ ○              │
└──────────┴──────────────────────────────────────────┘
```

### Course Viewer UX Principles

1. **Step progress**: Prominent progress bar + step indicators
2. **Content-first**: Wide reading area, markdown rendered beautifully
3. **Exercise blocks**: Visually distinct (different background, border-left accent)
4. **Resource links**: Open in new tab (target="_blank")
5. **Navigation**: Previous/Next buttons at bottom, step dots for jumping
6. **Completion CTA**: After last step, prominent "Ukończ kurs" button that updates passport
