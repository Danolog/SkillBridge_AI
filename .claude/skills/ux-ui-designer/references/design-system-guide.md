# Design System Guide — Token Definitions & Component Specs

This reference provides detailed token definitions and component specifications for building consistent, accessible interfaces. All values are optimized for Tailwind CSS v4 + shadcn/ui conversion.

**CRITICAL**: The values below are REFERENCE RANGES, not defaults to copy blindly. Every project should derive its actual tokens from the Brand Personality (Phase 2) and the visual style chosen in Phase 0 Discovery Interview. See `references/visual-styles.md` for archetype-specific token values.

**Style-aware usage**: This guide covers tokens for ALL visual styles (Light, Dark, Hybrid). Not every section applies to every style — check which style you're building before applying tokens.

## Color System

### Semantic Color Architecture

Design tokens should use semantic names, not raw values. This allows theming and dark mode support.

```
Layer 1: Primitives (raw values)
  indigo-600: #4F46E5

Layer 2: Semantic tokens (what they mean)
  --color-primary: var(--indigo-600)

Layer 3: Component tokens (where they're used)
  --button-bg: var(--color-primary)
```

### Recommended Palette Structure

**Primary** — main brand/action color. Used for: CTA buttons, active states, links, focus rings.
- primary: Main shade (sufficient contrast on white bg)
- primary-hover: 10% darker
- primary-light: Tinted background for badges, alerts, highlights

**Neutral** — the backbone. 60-70% of any interface is neutral.
- 50: Lightest bg (cards on colored bg)
- 100: Secondary bg (sidebar, table stripes)
- 200: Borders, dividers
- 300: Disabled states
- 400: Placeholder text
- 500: Secondary text, icons
- 700: Primary text
- 900: Headings

**Semantic** — communicating status:
- success/green: Completed, positive, active
- warning/amber: Needs attention, in progress
- error/red: Failed, destructive, missing
- info/blue: Informational, neutral highlight

### Dark Mode Tokens (🌙 Midnight Cyber / Premium Dark)

Full dark mode requires a complete token set, not just inverted colors:

```css
:root[data-theme="dark"] {
  /* Backgrounds — layered depth, NOT flat black */
  --color-bg: #0B0E14;              /* Obsidian Deep — base layer */
  --color-bg-secondary: #161B22;    /* Dark Slate — cards, surfaces */
  --color-bg-tertiary: #1C2333;     /* Slightly lighter — hover states */
  --color-bg-elevated: #21262D;     /* Popovers, dropdowns */

  /* Text — never pure white on dark */
  --color-text: #E6EDF3;            /* Primary text — slightly warm */
  --color-text-secondary: #8B949E;  /* Secondary text */
  --color-text-muted: #484F58;      /* Disabled, hints */

  /* Borders — subtle, 1px */
  --color-border: #30363D;          /* Standard border */
  --color-border-muted: #21262D;    /* Subtle dividers */

  /* Accents with glow */
  --color-primary: #6366F1;         /* Electric Indigo */
  --color-primary-glow: rgba(99, 102, 241, 0.25);
  --color-accent: #22D3EE;          /* Cyber Cyan */
  --color-accent-glow: rgba(34, 211, 238, 0.25);

  /* Semantic — brighter on dark */
  --color-success: #3FB950;
  --color-warning: #D29922;
  --color-error: #F85149;
}
```

**Dark mode rules**:
1. NEVER use pure black (#000000) — use #0B0E14 for depth
2. NEVER use pure white (#FFFFFF) for text — use #E6EDF3
3. Create depth with background layers (base → surface → elevated), NOT shadows
4. Use 1px borders (#30363D) instead of shadows for card separation
5. Accent colors need glow (box-shadow with rgba) to pop on dark backgrounds
6. Status colors should be slightly brighter than light mode versions

### Hybrid Tokens (🌅 Cosmic Campus / Light+Dark)

Hybrid combines light content area with dark sidebar:

```css
:root {
  /* Light content area */
  --bg-main: #FAFAF9;
  --bg-card: #FFFFFF;
  --bg-tinted: #F5F3FF;             /* Lightly tinted sections */

  /* Dark sidebar */
  --bg-sidebar: #0B0E14;
  --bg-sidebar-surface: #161B22;
  --border-dark: #30363D;
  --text-on-dark: #F8FAFC;
  --text-on-dark-muted: #94A3B8;

  /* Light content text */
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --border-light: #E2E8F0;

  /* Shared accents */
  --color-primary: #6366F1;
  --color-primary-glow: rgba(99, 102, 241, 0.25);
  --color-accent: #22D3EE;
  --gradient-primary: linear-gradient(135deg, #6366F1, #22D3EE);
}
```

**Hybrid rules**:
1. Content area stays light (#FAFAF9) — readability priority
2. Sidebar is dark (#0B0E14) — premium brand statement
3. Cards use light glassmorphism (see Glassmorphism section)
4. Progress bars and data viz use gradient (Indigo → Cyan)
5. Glow effects on interactive elements (buttons, active states)

## Typography System

### Type Scale (1.25 ratio — Major Third)

| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| text-xs | 12px / 0.75rem | 16px / 1rem | Labels, timestamps, footnotes |
| text-sm | 14px / 0.875rem | 20px / 1.25rem | Secondary text, table cells, captions |
| text-base | 16px / 1rem | 24px / 1.5rem | Body text, form inputs |
| text-lg | 18px / 1.125rem | 28px / 1.75rem | Subtitles, card titles |
| text-xl | 20px / 1.25rem | 28px / 1.75rem | Section headings |
| text-2xl | 24px / 1.5rem | 32px / 2rem | Page titles |
| text-3xl | 30px / 1.875rem | 36px / 2.25rem | Hero headings |
| text-4xl | 36px / 2.25rem | 40px / 2.5rem | Landing page hero |

### Font Weights

| Token | Weight | Use |
|-------|--------|-----|
| normal | 400 | Body text, descriptions |
| medium | 500 | Labels, nav items, subtle emphasis |
| semibold | 600 | Card titles, buttons, section headers |
| bold | 700 | Page titles, headings, strong emphasis |

### Monospace / Data Font

For styles that use data-heavy UI (Dark, Hybrid), add a monospace font for numbers and metrics:

```css
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**When to use mono**:
- Stat card numbers: "78%", "1,250 XP", "~10h"
- Timestamps and dates
- Progress percentages
- Code blocks and technical data
- Table cells with numeric data

**When NOT to use mono**:
- Body text, descriptions
- Headings, titles
- Button labels
- Navigation items

### Triple Font System (Hybrid / Dark styles)

Some styles use 3 font families for hierarchy:

```css
--font-display: 'Nunito', sans-serif;        /* Headings — rounded, friendly */
--font-body: 'Inter', sans-serif;             /* Body — clean readability */
--font-mono: 'JetBrains Mono', monospace;     /* Data — tech feel */
```

**Mapping**: display → h1-h3 | body → paragraphs, buttons, nav | mono → numbers, stats, code

### Typography Rules

1. **Maximum 2 font weights per screen** for visual calm
2. **Line length**: 50-75 characters for body text (max-width: ~65ch)
3. **Paragraph spacing**: Use margin-bottom equal to line-height (1.5rem for base text)
4. **Heading spacing**: margin-top 2x, margin-bottom 1x
5. **Never use pure black (#000000)** — use #111827 (gray-900) for softer contrast
6. **Dark mode text**: use #E6EDF3, never #FFFFFF — reduces eye strain
7. **Mono font size**: typically 1-2px smaller than body equivalent (14px mono ≈ 16px body visual weight)

## Spacing System

### 4px Base Unit Grid

All spacing values should be multiples of 4px:

| Token | Value | Common Use |
|-------|-------|-----------|
| space-1 | 4px | Inline icon gap, tight padding |
| space-2 | 8px | Badge padding, small gaps |
| space-3 | 12px | Button padding-y, list item gap |
| space-4 | 16px | Card padding (tight), input padding-x |
| space-5 | 20px | Section internal gaps |
| space-6 | 24px | Card padding (standard), grid gap |
| space-8 | 32px | Section spacing |
| space-10 | 40px | Large section breaks |
| space-12 | 48px | Page section spacing |
| space-16 | 64px | Major page divisions |

### Spacing Rules

1. **Consistent padding within components**: Cards = 24px, Buttons = 12px vertical / 16px horizontal, Inputs = 12px vertical / 16px horizontal
2. **Grid gap**: 16px between cards on mobile, 24px on desktop
3. **Section spacing**: 48px between major page sections
4. **Sidebar padding**: 16px horizontal, 8px between items

## Border Radius System

| Token | Value | Use |
|-------|-------|-----|
| rounded-sm | 4px | Badges, small elements |
| rounded-md | 6px | Inputs, buttons |
| rounded-lg | 8px | Cards, dropdowns |
| rounded-xl | 12px | Modals, large cards |
| rounded-full | 9999px | Avatars, pills |

**CSS custom property mapping**: In wireframes, use `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill` as CSS variable names. The `rounded-*` names above map to Tailwind classes for production.

2026 trend: move toward slightly larger radii (8-12px for cards) for softer feel.

## Shadow System

| Token | Value | Use |
|-------|-------|-----|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | Buttons, inputs |
| shadow-md | 0 4px 6px -1px rgba(0,0,0,0.1) | Cards, dropdowns |
| shadow-lg | 0 10px 15px -3px rgba(0,0,0,0.1) | Modals, popovers |
| shadow-xl | 0 20px 25px -5px rgba(0,0,0,0.1) | Large dialogs |

2026 trend: use shadows instead of borders for elevation. Lighter, more diffused shadows feel more modern.

### Glow Shadows (🌙 Dark / 🌅 Hybrid)

For dark and hybrid styles, replace neutral shadows with colored glow:

```css
/* Colored glow shadows — use primary/accent rgba */
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);
--shadow-glow-hover: 0 0 30px rgba(99, 102, 241, 0.25);
--shadow-glow-cyan: 0 0 20px rgba(34, 211, 238, 0.15);
--shadow-glow-success: 0 0 15px rgba(16, 185, 129, 0.2);
--shadow-glow-error: 0 0 15px rgba(239, 68, 68, 0.2);

/* Tinted shadows for light backgrounds (Hybrid) */
--shadow-tinted-sm: 0 1px 3px rgba(99, 102, 241, 0.06);
--shadow-tinted-md: 0 4px 16px rgba(99, 102, 241, 0.08);
--shadow-tinted-lg: 0 8px 30px rgba(99, 102, 241, 0.12);
```

**Glow rules**:
1. Glow on hover, not on rest state (except active/selected items)
2. Use primary color glow for interactive elements (buttons, links)
3. Use accent (cyan) glow for data visualization and progress
4. Use semantic glow (success/error) only for status indicators
5. Keep glow subtle — opacity 0.15-0.25, never above 0.3

## Glassmorphism

### Light Glassmorphism (🌅 Hybrid — cards on light bg)

```css
.card-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 16px;
}

.card-glass:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Dark Glassmorphism (🌙 Dark — cards on dark bg)

```css
.card-glass-dark {
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid #30363D;
  border-radius: 16px;
}

.card-glass-dark:hover {
  background: rgba(22, 27, 34, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.1);
}
```

### Glassmorphism Rules

1. **Always include `-webkit-backdrop-filter`** — Safari requires it
2. **Fallback**: if backdrop-filter not supported, use solid bg with opacity
3. **Performance**: limit to max 5-6 glass elements visible at once
4. **Light glass**: use white rgba (0.7-0.9 opacity), blur 10-16px
5. **Dark glass**: use dark rgba (0.5-0.7 opacity), blur 16-24px
6. **Borders**: always add 1px border for definition — glass without border looks muddy
7. **Contrast**: ensure text on glass passes WCAG AA (4.5:1 ratio)

## Bento Grid Layout

### Dashboard Layout Pattern (🌙 Dark / 🌅 Hybrid)

Bento Grid = asymmetric card grid with varied sizes, like Apple's widget layout.

```
┌──────────────┬──────────┬──────────┐
│              │          │          │
│   LARGE      │  MEDIUM  │  MEDIUM  │
│   (2 cols)   │  (1 col) │  (1 col) │
│              │          │          │
├──────────────┼──────────┴──────────┤
│              │                     │
│   MEDIUM     │    LARGE            │
│   (1 col)    │    (2 cols)         │
│              │                     │
├──────┬───────┼──────────┬──────────┤
│ SMALL│ SMALL │  MEDIUM  │  MEDIUM  │
│      │       │          │          │
└──────┴───────┴──────────┴──────────┘
```

### CSS Implementation

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Card sizes */
.bento-small { grid-column: span 1; }
.bento-medium { grid-column: span 1; min-height: 200px; }
.bento-large { grid-column: span 2; min-height: 280px; }
.bento-wide { grid-column: span 3; }
.bento-full { grid-column: span 4; }

/* Responsive: stack on mobile */
@media (max-width: 768px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-large, .bento-wide, .bento-full { grid-column: span 1; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .bento-large { grid-column: span 2; }
  .bento-wide, .bento-full { grid-column: span 2; }
}
```

### Bento Grid Rules

1. **Visual hierarchy**: 1-2 large cards (hero metrics), rest medium/small
2. **No uniform grids**: vary card sizes for visual interest
3. **Content drives size**: stat cards = small, charts = large, lists = medium
4. **Gap consistency**: always 16px (dark) or 20-24px (light/hybrid)
5. **Card aspect ratios**: avoid tall narrow cards — min 1:1.5 ratio
6. **Mobile**: single column stack, all cards full width

## Component Specifications

### Button Variants

| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| Primary | --color-primary | white | none | Main CTA, submit actions |
| Secondary | transparent | --color-primary | 1px solid --color-primary | Secondary actions |
| Ghost | transparent | --color-text-secondary | none | Tertiary, cancel |
| Destructive | --color-error | white | none | Delete, remove |

**Button sizes**: sm (h-8, text-sm), md (h-10, text-sm), lg (h-12, text-base)

**All buttons need**: hover state (darken 10%), active state (darken 15%), focus ring (2px offset, primary color), disabled state (opacity 0.5, cursor not-allowed)

**Style-specific button enhancements**:
- ☀️ Playful: pill shape (radius 9999px), colored shadow matching bg, spring hover
- 🌙 Dark: glow on hover (box-shadow: 0 0 20px primary-glow), subtle border 1px
- 🌅 Hybrid: pill shape + glow on primary buttons, gradient bg for hero CTAs

### Card Component

```
┌─────────────────────────────┐
│ padding: 24px               │
│                             │
│ [Optional: Header]          │
│ text-lg, font-semibold      │
│                             │
│ [Content Area]              │
│ text-base, color-secondary  │
│                             │
│ [Optional: Footer/Actions]  │
│ border-top, padding-top: 16 │
└─────────────────────────────┘
☀️ Light: bg white / shadow-md / rounded-lg / border none
🌙 Dark: bg rgba(22,27,34,0.6) / backdrop-filter blur(20px) / border 1px #30363D / rounded-xl
🌅 Hybrid: bg rgba(255,255,255,0.8) / backdrop-filter blur(12px) / border 1px rgba(99,102,241,0.1) / rounded-xl / shadow-tinted-md
```

### Sidebar Navigation

```
┌──────────┬──────────────────────────────┐
│ SIDEBAR  │                              │
│ 240-280px│    MAIN CONTENT              │
│          │    max-width: 1200px         │
│ Logo     │    padding: 24-32px          │
│ ──────── │                              │
│ Nav Item │                              │
│ Nav Item │                              │
│ Nav Item │                              │
│          │                              │
│ ──────── │                              │
│ Profile  │                              │
└──────────┴──────────────────────────────┘
```

Sidebar specs (☀️ Light):
- Width: 240-280px expanded, 64px collapsed
- Background: --color-sidebar (slightly off-white or very light gray)
- Nav items: height 40px, padding 8px 16px, rounded-md, gap 4px between items
- Active item: bg primary-light, text primary, font-medium
- Hover: bg gray-100
- Icons: 20px, consistent set (Lucide recommended)
- Logo area: height 64px, padding 16px, border-bottom
- User/profile area: bottom of sidebar, border-top

Sidebar specs (🌙 Dark / 🌅 Hybrid):
- Width: 260px expanded, 64px collapsed
- Background: #0B0E14 (obsidian deep)
- Border-right: 1px solid #30363D
- Nav items: height 44px, padding 10px 16px, rounded-lg, gap 2px
- Active item: bg rgba(99, 102, 241, 0.1), border-left 3px solid #6366F1, text #F8FAFC
- Hover: bg #161B22
- Icons: 20px, color #8B949E, active color #F8FAFC
- Logo area: height 64px, text with subtle glow (text-shadow: 0 0 20px rgba(99,102,241,0.3))
- User/profile area: bottom, border-top 1px #30363D, avatar + name + role

### Form Inputs

```
[Label]  ← text-sm, font-medium, color-text, mb-1
┌───────────────────────────────────┐
│ Placeholder text                  │  ← h-10, px-3, text-base
└───────────────────────────────────┘
[Helper text] ← text-xs, color-text-secondary
[Error text]  ← text-xs, color-error (replaces helper on error)
```

Input states:
- Default: border 1px gray-300
- Focus: border primary, ring 2px primary/20%
- Error: border error, ring 2px error/20%
- Disabled: bg gray-50, opacity 0.7

### Data Table

```
┌──────────┬──────────┬──────────┬──────────┐
│ Header ▲ │ Header   │ Header   │ Actions  │ ← bg-gray-50, text-xs uppercase, font-medium
├──────────┼──────────┼──────────┼──────────┤
│ Cell     │ Cell     │ Cell     │ [Edit]   │ ← text-sm, py-3, border-bottom
├──────────┼──────────┼──────────┼──────────┤
│ Cell     │ Cell     │ Cell     │ [Edit]   │
└──────────┴──────────┴──────────┴──────────┘
```

Table specs:
- Header: sticky, bg gray-50, text-xs, uppercase, letter-spacing 0.05em
- Rows: hover bg gray-50, border-bottom gray-200
- Cell padding: 12px horizontal, 12px vertical
- Responsive: horizontal scroll wrapper on mobile

### Empty State

```
┌─────────────────────────────┐
│                             │
│     [Illustration/Icon]     │
│      64px, color-gray-400   │
│                             │
│   "Nie masz jeszcze..."     │
│   text-lg, font-medium      │
│                             │
│   "Zacznij od..."           │
│   text-sm, color-secondary  │
│                             │
│     [ Główna Akcja ]        │
│     button primary           │
│                             │
└─────────────────────────────┘
centered, padding 48px vertical
```

### Loading Skeleton

Use CSS-only pulse animation for loading states:
```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}
@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Animation & Easing

### Easing Functions

| Token | Value | Use |
|-------|-------|-----|
| --ease-smooth | cubic-bezier(0.4, 0, 0.2, 1) | General transitions |
| --ease-spring | cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy, playful (☀️ / 🌅) |
| --ease-out | cubic-bezier(0, 0, 0.2, 1) | Elements entering |
| --ease-in | cubic-bezier(0.4, 0, 1, 1) | Elements leaving |

### Durations

| Token | Value | Use |
|-------|-------|-----|
| --duration-fast | 150ms | Hover states, color changes |
| --duration-normal | 300ms | Card hover, expand/collapse |
| --duration-slow | 500ms | Page transitions, modals |

### Style-specific Animations

**☀️ Playful**: spring easing, confetti on achievements, bouncy hover (translateY -4px)
**🌙 Dark**: smooth easing, glow pulse on active, subtle scale (1.02) on hover
**🌅 Hybrid**: spring for UI, smooth for glow effects, confetti for achievements

### Micro-interaction Patterns

```css
/* Card hover lift (all styles) */
.card:hover { transform: translateY(-2px); transition: all var(--duration-normal) var(--ease-smooth); }

/* Glow pulse (Dark/Hybrid) */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 15px var(--color-primary-glow); }
  50% { box-shadow: 0 0 25px var(--color-primary-glow); }
}

/* Progress bar shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Count-up animation (use JS for numbers) */
/* Stagger children entrance */
.stagger-children > * {
  opacity: 0; transform: translateY(10px);
  animation: fade-up 0.4s var(--ease-spring) forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
```

## Responsive Breakpoints

| Breakpoint | Width | Target |
|-----------|-------|--------|
| mobile | < 640px | Phones |
| sm | ≥ 640px | Large phones |
| md | ≥ 768px | Tablets |
| lg | ≥ 1024px | Laptops |
| xl | ≥ 1280px | Desktops |

### Mobile-first patterns:
- Sidebar → hamburger menu on mobile
- Multi-column grid → single column stack
- Horizontal table → cards or horizontal scroll
- Side-by-side forms → stacked
- Reduce padding by ~25% on mobile

## Mapping to Tailwind CSS v4 + shadcn/ui

When these wireframes are converted to production code:

| Design System Token | Tailwind Class |
|-------------------|----------------|
| --color-primary | bg-primary / text-primary |
| --text-sm | text-sm |
| --space-6 | p-6 / gap-6 |
| --rounded-lg | rounded-lg |
| --shadow-md | shadow-md |

shadcn/ui component mapping:
| Wireframe Component | shadcn/ui |
|-------------------|-----------|
| Button (all variants) | `<Button variant="...">` |
| Card | `<Card>` |
| Input | `<Input>` |
| Select/Dropdown | `<Select>` |
| Modal | `<Dialog>` |
| Side panel | `<Sheet>` |
| Tabs | `<Tabs>` |
| Table | `<Table>` |
| Badge | `<Badge>` |
| Progress | `<Progress>` |
| Toast | `<Sonner>` (toast) |
| Tooltip | `<Tooltip>` |
