# Dashboard Layout — Design Review Guide

## Screen Map

| Screen | File | Description |
|--------|------|-------------|
| Dashboard Hub | `wireframes/dashboard.html` | Main dashboard with sidebar, welcome card, progress bar, 4 nav tiles |

## Design Decisions

### Cosmic Campus / Hybrid Style (consistent with phases 02-03)
- **Dark sidebar** (#0B0E14) with indigo active indicator bar (3px left)
- **Light content area** (#FAFAF9) — easy on eyes for daily use
- **Glass-morphism welcome card** — white bg, subtle indigo border, gradient top bar
- **Gradient accents** — progress bar, avatar, logo text use the signature indigo→cyan gradient

### Navigation
- 5 items: Dashboard, Skill Map, Gap Analysis, Mikro-kursy, Paszport
- Active state: left 3px gradient bar + indigo bg tint + full opacity text
- Hover: subtle white bg overlay
- User info + logout at sidebar bottom

### Dashboard Hub
- Welcome card: greeting + university/field/goal subtitle + large avatar + progress bar
- 4 tiles: 2x2 grid with colored icon variants (indigo, amber, emerald, cyan)
- Tile hover: lift + shadow + top gradient border reveal (consistent with landing page value cards)
- Stats in JetBrains Mono

### Mobile
- Sidebar collapses off-screen
- Hamburger button in dark top bar
- Overlay backdrop on sidebar open
- Tiles stack to single column

## Implementation Notes

- Sidebar is `"use client"` (needs `usePathname` for active state, `authClient.signOut`)
- Layout is server component (auth check)
- Dashboard page is server component (DB queries for counts)
- DashboardHub is client component (receives data as props)
- Use lucide-react icons matching the SVGs in wireframe
