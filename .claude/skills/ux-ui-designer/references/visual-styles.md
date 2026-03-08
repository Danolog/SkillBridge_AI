# Visual Style Archetypes

Choose or blend these archetypes based on the brand personality and user's preferences from Discovery Interview. Each includes concrete CSS values and design decisions.

---

## Style 1: ☀️ Playful & Energetic (Duolingo / Spotify / Headspace)

**When to use:** Apps for young users (students, gamers), learning platforms, fitness, social features, anything that benefits from motivation and delight.

**Core philosophy:** Bold colors create energy. Rounded shapes feel friendly and approachable. Celebrating achievements keeps users engaged. The interface should feel alive — things move, respond, and reward.

### Color Palette
```css
:root {
  --color-primary: #7C3AED;          /* Bold purple */
  --color-primary-hover: #6D28D9;
  --color-primary-light: #EDE9FE;
  --color-primary-rgb: 124, 58, 237;
  --color-accent: #F59E0B;           /* Warm amber/gold */
  --color-accent-light: #FEF3C7;
  --color-secondary-1: #06B6D4;     /* Cyan */
  --color-secondary-2: #10B981;     /* Emerald */
  --color-secondary-3: #F43F5E;     /* Rose */
  --color-bg: #FAFAF9;              /* Warm off-white */
  --color-bg-secondary: #F5F3FF;    /* Light purple tint */
  --color-surface: #FFFFFF;
  --color-text: #1E1B4B;           /* Deep indigo */
  --color-text-secondary: #6B7280;
  --gradient-primary: linear-gradient(135deg, #7C3AED, #2563EB);
  --gradient-accent: linear-gradient(135deg, #F59E0B, #EF4444);
}
```

### Typography
```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
--font-display: 'Nunito', sans-serif;   /* Headings — rounded, friendly */
--font-body: 'Inter', sans-serif;        /* Body — clean, readable */
h1 { font-family: var(--font-display); font-weight: 800; font-size: 2rem; }
h2 { font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; }
```

### Shape Language
```css
--radius-sm: 8px;        /* Inputs */
--radius-md: 12px;       /* Small cards */
--radius-lg: 16px;       /* Cards */
--radius-xl: 24px;       /* Headers */
--radius-pill: 9999px;   /* Buttons, badges — PILL SHAPE */
.btn { border-radius: 9999px; }
.card { border-radius: 16px; }
```

### Shadows & Animations
```css
--shadow-md: 0 4px 16px rgba(124, 58, 237, 0.12);
--shadow-lg: 0 8px 30px rgba(124, 58, 237, 0.15);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s var(--ease-spring);
}
```

### Sidebar
```css
.sidebar {
  background: #1E1B4B;              /* Deep dark purple */
  color: white;
}
.sidebar .nav-item.active {
  background: rgba(124, 58, 237, 0.3);
  border-radius: 12px;
}
```

### Microcopy Tone
- "🚀 Twoja przygoda się zaczyna!"
- "🎉 Brawo! Zdobyłeś nową kompetencję!"
- "💪 5 luk do zamknięcia. Zacznij od najważniejszej!"
- "🔥 72% — jesteś na dobrej drodze!"

---

## Style 2: 🌙 Premium Dark / Midnight Cyber (Linear / Vercel / Raycast)

**When to use:** Developer tools, analytics platforms, professional creative tools, Gen Z tech products, apps where users spend hours daily. Dark mode by default.

**Core philosophy:** Obsidian-grade dark mode reduces eye strain during long sessions. Neon accents on deep backgrounds create focus and hierarchy. Glassmorphism adds depth. Monospace data fonts signal precision.

### Color Palette — "Midnight Cyber"
```css
:root {
  /* Backgrounds — Z-Axis Depth System */
  --bg-deep: #0B0E14;             /* Obsidian Deep — main bg, NEVER pure #000 */
  --bg-surface: #161B22;          /* Dark Slate — cards, panels */
  --bg-elevated: #1C2333;         /* Slightly brighter — elevated cards */

  /* Accents — Neon on Dark */
  --color-primary: #6366F1;       /* Electric Indigo — CTAs, active states */
  --color-primary-rgb: 99, 102, 241;
  --color-primary-glow: rgba(99, 102, 241, 0.3);
  --color-accent: #22D3EE;        /* Cyber Cyan — charts, data, highlights */
  --color-accent-rgb: 34, 211, 238;
  --color-accent-glow: rgba(34, 211, 238, 0.3);

  /* Gradient — signature data viz gradient */
  --gradient-primary: linear-gradient(135deg, #6366F1, #22D3EE);

  /* Text — NEVER pure white on dark */
  --text-primary: #F8FAFC;        /* Ghost White at 95% opacity */
  --text-secondary: #94A3B8;      /* Cool Slate at 60-70% */
  --text-muted: #64748B;

  /* Borders — "laser cut" effect */
  --border-dark: #30363D;         /* Steel Stroke — 1px card borders */

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
}
```

### Typography — "The Next-Gen Standard"
```css
/* Option A: Geist Sans (if available) + JetBrains Mono */
/* Option B (Google Fonts): Inter Tight + JetBrains Mono */
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

--font-display: 'Inter Tight', sans-serif;   /* Headings — sharp, geometric */
--font-body: 'Inter', sans-serif;             /* Body text */
--font-mono: 'JetBrains Mono', monospace;     /* Data, numbers, timestamps */

/* Heading rules */
h1 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; }
h2 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.01em; }

/* Data in monospace */
.data-value { font-family: var(--font-mono); font-weight: 500; }
.timestamp { font-family: var(--font-mono); font-weight: 400; color: var(--text-secondary); }

/* Pro tip: reduce white text intensity */
body { color: rgba(248, 250, 252, 0.95); }
.text-muted { color: rgba(148, 163, 184, 0.7); }
```

### Shape Language
```css
--radius-sm: 8px;
--radius-md: 12px;       /* Buttons — tech, not toy */
--radius-lg: 16px;       /* Cards */
.btn { border-radius: 12px; }  /* NOT pill — more angular for tech feel */
.badge { border-radius: 8px; }
.card { border-radius: 16px; }
```

### Glassmorphism & Glow
```css
/* Dark glass cards */
.card {
  background: rgba(22, 27, 34, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-lg);
}
.card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 20px var(--color-primary-glow);
}

/* Glow buttons (replaces shadow) */
.btn-primary {
  background: var(--color-primary);
  box-shadow: 0 0 20px var(--color-primary-glow);
}
.btn-primary:hover {
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
}

/* Progress bar glow */
.progress-fill {
  background: var(--gradient-primary);
  box-shadow: 0 0 10px var(--color-accent-glow);
}

/* Pulse on critical/missing items */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
}
```

### Sidebar (Dark on dark)
```css
.sidebar {
  background: var(--bg-deep);
  border-right: 1px solid var(--border-dark);
}
.nav-item.active {
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid var(--color-primary);
}
.logo { text-shadow: 0 0 20px var(--color-primary-glow); }
```

### Microcopy — Gen Z Style
- "Level up your craft, Kasia 🚀"
- "Deep dive: dlaczego to ważne?"
- "Skill unlocked! 🏆 What's next?"
- "All caught up. Take a break ☕"
- "Resume deep dive →"
- Numbers always in JetBrains Mono: "78%" / "1,250 XP" / "⏱️ ~10h"

---

## Style 3: 🌅 Cosmic Campus / Hybrid (Best of Both Worlds)

**When to use:** When you want the approachability of a light theme with the premium feel of dark mode elements. Ideal for edutech, SaaS dashboards, and products targeting Gen Z who appreciate modern design but need readability for long sessions.

**Core philosophy:** Light content area for readability + dark sidebar for premium feel + glow effects for modernity + glassmorphism for depth. The best of Playful and Midnight Cyber combined.

### Color Palette — "Cosmic Campus"
```css
:root {
  /* Light content area */
  --bg-main: #FAFAF9;              /* Warm off-white — NOT pure white */
  --bg-card: #FFFFFF;               /* Cards */
  --bg-tinted: #F5F3FF;            /* Light primary tint for sections */

  /* Dark sidebar (from Midnight Cyber) */
  --bg-sidebar: #0B0E14;           /* Obsidian Deep */
  --bg-sidebar-surface: #161B22;   /* Hover/active in sidebar */

  /* Primary: Electric Indigo (from Midnight — more tech than pure purple) */
  --color-primary: #6366F1;
  --color-primary-hover: #4F46E5;
  --color-primary-light: #EEF2FF;
  --color-primary-rgb: 99, 102, 241;
  --color-primary-glow: rgba(99, 102, 241, 0.25);

  /* Accent: Cyber Cyan (from Midnight — for data viz) */
  --color-accent: #22D3EE;
  --color-accent-light: #ECFEFF;
  --color-accent-rgb: 34, 211, 238;
  --color-accent-glow: rgba(34, 211, 238, 0.25);

  /* Signature gradient */
  --gradient-primary: linear-gradient(135deg, #6366F1, #22D3EE);

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Text (dark on light) */
  --text-primary: #0F172A;         /* Slate 900 */
  --text-secondary: #64748B;       /* Slate 500 */
  --text-muted: #94A3B8;           /* Slate 400 */
  --text-on-dark: #F8FAFC;         /* For sidebar */
  --text-on-dark-muted: #94A3B8;

  /* Borders */
  --border-light: #E2E8F0;         /* On light bg */
  --border-dark: #30363D;          /* On sidebar */
  --border-glass: rgba(99, 102, 241, 0.1);  /* Glassmorphism */

  /* Shadows with glow */
  --shadow-sm: 0 1px 3px rgba(99, 102, 241, 0.06);
  --shadow-md: 0 4px 16px rgba(99, 102, 241, 0.08);
  --shadow-lg: 0 8px 30px rgba(99, 102, 241, 0.12);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);
}
```

### Typography — Triple Font System
```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

--font-display: 'Nunito', sans-serif;        /* Headings — friendly, rounded */
--font-body: 'Inter', sans-serif;             /* Body — clean, readable */
--font-mono: 'JetBrains Mono', monospace;     /* Data — tech feel */

h1 { font-family: var(--font-display); font-weight: 800; font-size: 2rem; letter-spacing: -0.02em; }
h2 { font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; }
.data-value { font-family: var(--font-mono); font-weight: 500; }
```

### Cards — Light Glassmorphism
```css
.card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}
.card:hover {
  box-shadow: var(--shadow-lg);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}
```

### Sidebar — Dark Premium
```css
.sidebar {
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-dark);
  color: var(--text-on-dark);
}
.nav-item.active {
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid var(--color-primary);
}
.logo {
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}
```

### Buttons — Pill + Glow
```css
.btn-primary {
  background: var(--color-primary);
  border-radius: 9999px;
  box-shadow: 0 0 20px var(--color-primary-glow);
  color: white;
}
```

### Progress — Gradient + Glow
```css
.progress-fill {
  background: var(--gradient-primary);
  border-radius: 9999px;
  box-shadow: 0 0 10px var(--color-accent-glow);
}
```

### Footer — Dark (visual bookend with sidebar)
```css
.footer {
  background: var(--bg-sidebar);
  color: var(--text-on-dark-muted);
}
```

### Microcopy — Polish + Gen Z English
- "Level up your craft, Kasia 🚀" (powitanie)
- "🎯 Zamknij tę lukę" (CTA)
- "Deep dive: dlaczego to ważne?" (expandable)
- "Skill unlocked! 🏆" (po ukończeniu kursu)
- "All caught up. Take a break ☕" (pusty stan)
- Dane w monospace: "78%" / "⏱️ ~10h" / "1,250 XP"

---

## Style 4: 🌿 Friendly & Clean (Notion / Figma / Arc)

**When to use:** Productivity tools, collaboration platforms, content management — products where clarity and calm are more important than excitement.

### Color Palette
```css
:root {
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F7F6F3;       /* Warm neutral */
  --color-surface: #FFFFFF;
  --color-border: #E3E2DE;
  --color-text: #37352F;                /* Warm dark, not pure black */
  --color-text-secondary: #787774;
  --color-primary: #2383E2;             /* Clean blue */
  --color-accent: #EB5757;              /* Warm red for emphasis */
}
```

### Typography
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
--font-family: 'DM Sans', -apple-system, sans-serif;
```

### Shapes
```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
.btn { border-radius: 6px; } /* Subtle rounding */
```

---

## Style 5: 💎 Bold & Branded (Stripe / Loom / Pitch)

**When to use:** B2B products, marketing-forward tools — products that need to look premium and branded.

### Color Palette
```css
:root {
  --color-primary: #635BFF;            /* Stripe purple */
  --color-bg: #F6F9FC;                 /* Cool light blue-gray */
  --color-surface: #FFFFFF;
  --color-text: #0A2540;               /* Very dark blue, not black */
  --gradient-hero: linear-gradient(135deg, #635BFF, #0A2540);
}
```

### Distinctive: Strong branded headers
```css
.page-header {
  background: var(--gradient-hero);
  padding: 40px;
  border-radius: 16px;
  color: white;
}
```
