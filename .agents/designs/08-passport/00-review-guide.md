# Competency Passport — Design Review Guide

## Brand Consistency

Follows the established **Cosmic Campus / Hybrid** design system:
- Dark sidebar (#0B0E14) with gradient active indicator
- Light content area with white cards
- Indigo→Cyan gradient for accents, progress bars, avatars
- Nunito 800 for headings, JetBrains Mono for data/numbers
- Pill-shaped badges and buttons (border-radius: 9999px)
- Colored shadows and glow effects on interactive elements

## Screen Map

| Screen | File | Description |
|--------|------|-------------|
| Authenticated Passport | `wireframes/passport-authenticated.html` | Full passport inside dashboard sidebar layout |
| Public Passport | `wireframes/passport-public.html` | Standalone read-only view, no auth required |

## Key Design Decisions

### 1. Single Card Layout
The passport is a single cohesive card (not multiple cards) — mimicking a real "document" feel. Sections are separated by dividers and background color changes.

### 2. Competency Badges
Three-color pill badges with status icons:
- **Green (Masz)**: Check icon — acquired competencies
- **Yellow (W trakcie)**: Clock icon — in progress
- **Red (Brakuje)**: X icon — missing competencies

### 3. Progress Bar
12px height with gradient fill + glow shadow. JetBrains Mono for the percentage value. Animated on page load with spring easing.

### 4. Public View Differences
- No sidebar, no navigation
- Minimal top bar (logo only)
- "Zweryfikowany" badge in top-right corner
- Dark CTA card at bottom: "Stwórz swój Paszport Kompetencji"
- Dark footer bar matching the top bar

### 5. PDF Export
The passport card has an ID (`passport-card`) for html2canvas to capture. The card is designed to fit well on an A4 page.

## Implementation Notes

### CSS Class Prefix
All passport-specific classes use `pp-` prefix (consistent with `db-`, `ga-`, `mc-` pattern).

### Components to Create
1. `competency-badge.tsx` — Reusable badge with status prop
2. `passport-view.tsx` — "use client", full card with ref for PDF
3. `passport-public.tsx` — Server/client component for public view
4. `pdf-export.tsx` — html2canvas + jsPDF button

### Responsive Breakpoints
- Desktop: Full layout with sidebar
- Mobile (≤768px): Stacked profile, hamburger menu, full-width buttons
- Small (≤480px): Smaller badges, reduced font sizes
